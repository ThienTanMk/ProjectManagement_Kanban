"use client";
import { useState, useMemo } from "react";
import {
  Paper,
  Grid,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Timeline,
  Progress,
  Avatar,
  Card,
  Divider,
  Box,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Select,
  Loader,
} from "@mantine/core";
import {
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconUser,
  IconSparkles,
  IconRefresh,
  IconBrain,
  IconChartBar,
  IconActivity,
  IconTarget,
  IconUsers,
} from "@tabler/icons-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useGetStatuses } from "@/hooks/status";
import { useCurrentProjectTasks } from "@/hooks/task";
import { useGetTeamMembers } from "@/hooks/project"; 

dayjs.extend(relativeTime);

// Api Gen AI
interface AIInsight {
  id: string;
  type: "warning" | "suggestion" | "success" | "info";
  title: string;
  description: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
}
// dùng cho mock data
interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  tasksAssigned: number;
  tasksCompleted: number;
  workloadPercentage: number;
}

const Summary: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>("7days");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: statuses = [], isLoading: statusesLoading } = useGetStatuses();
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useCurrentProjectTasks();
  
  const { data: teamMembersData = [], isLoading: teamMembersLoading } =
    useGetTeamMembers();

  const statusOverviewData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const statusCounts = statuses.map((status) => {
      const count = tasks.filter((task) => task.statusId === status.id).length;
      return {
        status: status.name,
        count,
        percentage: (count / tasks.length) * 100,
        color:
          status.name.toLowerCase().includes("done") ||
          status.name.toLowerCase().includes("complete")
            ? "#10b981"
            : status.name.toLowerCase().includes("progress")
            ? "#3b82f6"
            : status.name.toLowerCase().includes("review")
            ? "#f59e0b"
            : "#94a3b8",
      };
    });

    return statusCounts;
  }, [tasks, statuses]);

  const recentActivityData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const recentTasks = [...tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      )
      .slice(0, 10);

    return recentTasks.map((task) => {
      const isNew =
        dayjs().diff(dayjs(task.createdAt), "hour") < 24 &&
        task.createdAt === task.updatedAt;
      const isDone = statuses.find((s) => s.id === task.statusId)?.name
        .toLowerCase()
        .includes("done");

      let type: "created" | "updated" | "completed" | "assigned" = "updated";
      let icon = <IconActivity size={16} color="#f59e0b" />;

      if (isDone) {
        type = "completed";
        icon = <IconCheck size={16} color="#10b981" />;
      } else if (isNew) {
        type = "created";
        icon = <IconClock size={16} color="#3b82f6" />;
      } else if (task.assignees && task.assignees.length > 0) {
        type = "assigned";
        icon = <IconUser size={16} color="#8b5cf6" />;
      }

      return {
        id: task.id,
        type,
        taskName: task.name,
        userName: task.owner?.name || "Unknown",
        timestamp: dayjs(task.updatedAt || task.createdAt).fromNow(),
        icon,
      };
    });
  }, [tasks, statuses]);

  const priorityBreakdownData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const priorityCounts = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    tasks.forEach((task) => {
      if (task.priority) {
        priorityCounts[task.priority as keyof typeof priorityCounts]++;
      }
    });

    return [
      { priority: "High", count: priorityCounts.HIGH, color: "#ef4444" },
      { priority: "Medium", count: priorityCounts.MEDIUM, color: "#f59e0b" },
      { priority: "Low", count: priorityCounts.LOW, color: "#10b981" },
    ].filter((item) => item.count > 0);
  }, [tasks]);

  const teamWorkloadData = useMemo(() => {
    if (!teamMembersData || teamMembersData.length === 0) return [];

    return teamMembersData.map((member) => {
      // Đếm số tasks được assign cho member này
      const assignedTasks = tasks.filter((task) =>
        task.assignees?.some((assignee) => assignee.userId === member.userId)
      );

      // Đếm số tasks đã hoàn thành
      const completedTasks = assignedTasks.filter((task) => {
        const status = statuses.find((s) => s.id === task.statusId);
        return (
          status?.name.toLowerCase().includes("done") ||
          status?.name.toLowerCase().includes("complete")
        );
      });

      // Tính workload percentage (giả sử mỗi task = 10%)
      const workloadPercentage = Math.min(assignedTasks.length * 10, 100);

      return {
        id: member.userId,
        name: member.user.name,
        avatar: member.user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        tasksAssigned: assignedTasks.length,
        tasksCompleted: completedTasks.length,
        workloadPercentage,
      };
    });
  }, [teamMembersData, tasks, statuses]); 

  const teamWorkloadDataMock: TeamMember[] = [
    {
      id: "1",
      name: "John Doe",
      avatar: "JD",
      tasksAssigned: 12,
      tasksCompleted: 8,
      workloadPercentage: 75,
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "JS",
      tasksAssigned: 10,
      tasksCompleted: 9,
      workloadPercentage: 60,
    },
    {
      id: "3",
      name: "Mike Johnson",
      avatar: "MJ",
      tasksAssigned: 15,
      tasksCompleted: 5,
      workloadPercentage: 90,
    },
    {
      id: "4",
      name: "Sarah Wilson",
      avatar: "SW",
      tasksAssigned: 8,
      tasksCompleted: 7,
      workloadPercentage: 50,
    },
  ];

  const aiInsightsData: AIInsight[] = useMemo(() => {
    const insights: AIInsight[] = [];

    // Tasks có deadline gần
    const upcomingDeadlines = tasks.filter((task) => {
      if (!task.deadline) return false;
      const daysUntil = dayjs(task.deadline).diff(dayjs(), "day");
      return daysUntil >= 0 && daysUntil <= 2 && task.priority === "HIGH";
    });

    if (upcomingDeadlines.length > 0) {
      insights.push({
        id: "deadline-risk",
        type: "warning",
        title: "Potential Deadline Risk",
        description: `${upcomingDeadlines.length} high-priority tasks are approaching their deadlines within 48 hours. Consider reallocating resources or adjusting timelines.`,
        timestamp: "Just now",
        priority: "high",
      });
    }

    // Team workload không cân bằng
    if (teamWorkloadData.length > 0) {
      const maxWorkload = Math.max(
        ...teamWorkloadData.map((m) => m.workloadPercentage)
      );
      const minWorkload = Math.min(
        ...teamWorkloadData.map((m) => m.workloadPercentage)
      );
      const maxMember = teamWorkloadData.find(
        (m) => m.workloadPercentage === maxWorkload
      );
      const minMember = teamWorkloadData.find(
        (m) => m.workloadPercentage === minWorkload
      );

      if (maxWorkload - minWorkload > 40 && maxMember && minMember) {
        insights.push({
          id: "workload-balance",
          type: "suggestion",
          title: "Optimize Team Workload",
          description: `${maxMember.name} has ${maxWorkload}% workload capacity while ${minMember.name} is at ${minWorkload}%. Consider redistributing tasks for better balance.`,
          timestamp: "1 hour ago",
          priority: "medium",
        });
      }
    }

    // Sprint progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => {
      const status = statuses.find((s) => s.id === task.statusId);
      return (
        status?.name.toLowerCase().includes("done") ||
        status?.name.toLowerCase().includes("complete")
      );
    }).length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (completionRate > 30) {
      insights.push({
        id: "sprint-progress",
        type: "success",
        title: "Sprint Progress On Track",
        description: `Your team has completed ${completionRate.toFixed(1)}% of planned tasks. Based on current velocity, you're on track to complete the sprint goals.`,
        timestamp: "2 hours ago",
        priority: "low",
      });
    }

    return insights;
  }, [tasks, teamWorkloadData, statuses]);

   const aiInsightsDataMock: AIInsight[] = [
    {
      id: "1",
      type: "warning",
      title: "Potential Deadline Risk",
      description:
        "3 high-priority tasks are approaching their deadlines within 48 hours. Consider reallocating resources or adjusting timelines.",
      timestamp: "Just now",
      priority: "high",
    },
    {
      id: "2",
      type: "suggestion",
      title: "Optimize Team Workload",
      description:
        "Mike Johnson has 90% workload capacity while Sarah Wilson is at 50%. Consider redistributing tasks for better balance.",
      timestamp: "1 hour ago",
      priority: "medium",
    },
    {
      id: "3",
      type: "success",
      title: "Sprint Progress On Track",
      description:
        "Your team has completed 37.5% of planned tasks. Based on current velocity, you're on track to complete the sprint goals.",
      timestamp: "2 hours ago",
      priority: "low",
    },
    {
      id: "4",
      type: "info",
      title: "Dependency Alert",
      description:
        "Task 'Implement Authentication API' is blocking 4 other tasks. Prioritizing this task could unlock team productivity.",
      timestamp: "3 hours ago",
      priority: "high",
    },
    {
      id: "5",
      type: "suggestion",
      title: "Code Review Bottleneck",
      description:
        "5 tasks are waiting in 'In Review' status for more than 2 days. Consider assigning more reviewers or setting review time limits.",
      timestamp: "5 hours ago",
      priority: "medium",
    },
  ];

  // icon
  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "warning":
        return <IconAlertCircle size={20} color="#ef4444" />;
      case "suggestion":
        return <IconSparkles size={20} color="#3b82f6" />;
      case "success":
        return <IconCheck size={20} color="#10b981" />;
      case "info":
        return <IconBrain size={20} color="#8b5cf6" />;
    }
  };

  const getPriorityBadgeColor = (priority: AIInsight["priority"]) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchTasks();
    } catch (error) {
      console.error("Failed to refresh:", error);
    }
    setIsRefreshing(false);
  };

  if (statusesLoading || tasksLoading || teamMembersLoading) {
    return (
      <Box p="xl" style={{ display: "flex", justifyContent: "center" }}>
        <Loader size="lg" />
      </Box>
    );
  }


  return (
    <Box p="xl">
      {/* HEADER SECTION */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Project Summary</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Overview of your project's status and AI-powered insights
          </Text>
        </div>
        <Group gap="sm">
          <Select
            value={timeRange}
            onChange={(value) => setTimeRange(value || "7days")}
            data={[
              { value: "24hours", label: "Last 24 hours" },
              { value: "7days", label: "Last 7 days" },
              { value: "30days", label: "Last 30 days" },
              { value: "all", label: "All time" },
            ]}
            w={150}
          />
          <Tooltip label="Refresh data">
            <ActionIcon
              variant="light"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* chart*/}
      <Grid gutter="lg" mb="xl">
        {/* status overview */}
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconChartBar size={20} color="#3b82f6" />
                <Text fw={600} size="lg">
                  Status Overview
                </Text>
              </Group>
            </Group>

            {statusOverviewData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusOverviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label
                    >
                      {statusOverviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>

                <Stack gap="xs" mt="md">
                  {statusOverviewData.map((item) => (
                    <Group key={item.status} justify="space-between">
                      <Group gap="xs">
                        <Box
                          w={12}
                          h={12}
                          style={{
                            backgroundColor: item.color,
                            borderRadius: "50%",
                          }}
                        />
                        <Text size="sm">{item.status}</Text>
                      </Group>
                      <Badge variant="light" size="sm">
                        {item.count}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </>
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No tasks available
              </Text>
            )}
          </Card>
        </Grid.Col>

        {/* recent activity*/}
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconActivity size={20} color="#10b981" />
                <Text fw={600} size="lg">
                  Recent Activity
                </Text>
              </Group>
            </Group>

            <ScrollArea h={300}>
              {recentActivityData.length > 0 ? (
                <Timeline active={-1} bulletSize={24} lineWidth={2}>
                  {recentActivityData.map((activity) => (
                    <Timeline.Item
                      key={activity.id}
                      bullet={activity.icon}
                      title={
                        <Text size="sm" fw={500} lineClamp={1}>
                          {activity.taskName}
                        </Text>
                      }
                    >
                      <Text size="xs" c="dimmed" mt={4}>
                        {activity.userName} • {activity.timestamp}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No recent activities
                </Text>
              )}
            </ScrollArea>
          </Card>
        </Grid.Col>

        {/* Priority*/}
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconTarget size={20} color="#f59e0b" />
                <Text fw={600} size="lg">
                  Priority Breakdown
                </Text>
              </Group>
            </Group>

            {priorityBreakdownData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={priorityBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {priorityBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <Stack gap="xs" mt="md">
                  {priorityBreakdownData.map((item) => (
                    <Group key={item.priority} justify="space-between">
                      <Group gap="xs">
                        <Box
                          w={12}
                          h={12}
                          style={{
                            backgroundColor: item.color,
                            borderRadius: 4,
                          }}
                        />
                        <Text size="sm">{item.priority}</Text>
                      </Group>
                      <Text size="sm" fw={600}>
                        {item.count}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </>
            ) : (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No priority data available
              </Text>
            )}
          </Card>
        </Grid.Col>

        {/* team */}
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconUsers size={20} color="#8b5cf6" />
                <Text fw={600} size="lg">
                  Team Workload
                </Text>
              </Group>
            </Group>

            <ScrollArea h={300}>
              {/* {teamWorkloadData.length > 0 ? ( */}
              {teamWorkloadDataMock.length > 0 ? (

                <Stack gap="md">
                  {/* {teamWorkloadData.map((member) => ( */}
                  {teamWorkloadDataMock.map((member) => (

                    <Box key={member.id}>
                      <Group justify="space-between" mb={8}>
                        <Group gap="sm">
                          <Avatar color="blue" radius="xl" size="sm">
                            {member.avatar}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={500}>
                              {member.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {member.tasksCompleted}/{member.tasksAssigned}{" "}
                              tasks
                            </Text>
                          </div>
                        </Group>
                        <Badge
                          color={
                            member.workloadPercentage > 80
                              ? "red"
                              : member.workloadPercentage > 60
                              ? "yellow"
                              : "green"
                          }
                          variant="light"
                          size="sm"
                        >
                          {member.workloadPercentage}%
                        </Badge>
                      </Group>
                      <Progress
                        value={member.workloadPercentage}
                        color={
                          member.workloadPercentage > 80
                            ? "red"
                            : member.workloadPercentage > 60
                            ? "yellow"
                            : "green"
                        }
                        size="sm"
                        radius="xl"
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No team members assigned
                </Text>
              )}
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Gen AI */}
      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Group justify="space-between" mb="lg">
          <Group gap="sm">
            <IconBrain size={24} color="#8b5cf6" />
            <div>
              <Title order={3}>AI-Powered Insights</Title>
              <Text size="sm" c="dimmed" mt={4}>
                Smart recommendations and analysis from Gen AI
              </Text>
            </div>
          </Group>
          <Badge
            size="lg"
            variant="gradient"
            gradient={{ from: "violet", to: "blue", deg: 90 }}
            leftSection={<IconSparkles size={14} />}
          >
            {/* {aiInsightsData.length} Insights */}
            {aiInsightsDataMock.length} Insights
          </Badge>
        </Group>

        <Divider mb="lg" />

        <ScrollArea h={400}>
          {/* {aiInsightsData.length > 0 ? ( */}
          {aiInsightsDataMock.length > 0 ? (
            <Stack gap="md">
              {/* {aiInsightsData.map((insight) => ( */}
              {aiInsightsDataMock.map((insight) => (
                <Paper
                  key={insight.id}
                  p="md"
                  withBorder
                  radius="md"
                  style={{
                    borderLeft: `4px solid ${
                      insight.type === "warning"
                        ? "#ef4444"
                        : insight.type === "success"
                        ? "#10b981"
                        : insight.type === "suggestion"
                        ? "#3b82f6"
                        : "#8b5cf6"
                    }`,
                  }}
                >
                  <Group justify="space-between" align="flex-start" mb="sm">
                    <Group gap="sm">
                      {getInsightIcon(insight.type)}
                      <div>
                        <Text fw={600} size="sm">
                          {insight.title}
                        </Text>
                        <Text size="xs" c="dimmed" mt={2}>
                          {insight.timestamp}
                        </Text>
                      </div>
                    </Group>
                    <Badge
                      color={getPriorityBadgeColor(insight.priority)}
                      variant="light"
                      size="sm"
                    >
                      {insight.priority}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" mt="xs">
                    {insight.description}
                  </Text>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No insights available yet
            </Text>
          )}
        </ScrollArea>
      </Card>
    </Box>
  );
};

export default Summary;