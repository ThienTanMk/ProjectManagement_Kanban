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
  Tabs,
  SimpleGrid,
  RingProgress,
  ThemeIcon,
  Alert,
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
  IconCalendar,
  IconChartLine,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useGetStatuses } from "@/hooks/status";
import { useCurrentProjectTasks } from "@/hooks/task";
import { useGetTeamMembers } from "@/hooks/project";
import {
  useVelocity,
  useProjectHealth,
  useCompletionForecast,
  useSprintReport,
  useAIAnalysis,
} from "@/hooks/performances";
import { useProjectStore } from "@/stores/projectStore";
import { useAuth } from "@/hooks/useAuth";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

dayjs.extend(relativeTime);

interface AIInsight {
  id: string;
  type: "warning" | "suggestion" | "success" | "info";
  title: string;
  description: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
}

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
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [sprintStart, setSprintStart] = useState<string>(
    dayjs().subtract(14, "day").format("YYYY-MM-DD")
  );
  const [sprintEnd, setSprintEnd] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );

  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();
  const { data: statuses = [], isLoading: statusesLoading } = useGetStatuses();
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useCurrentProjectTasks();

  const { data: teamMembersData = [], isLoading: teamMembersLoading } =
    useGetTeamMembers();

  const { data: velocity, isLoading: velocityLoading } = useVelocity(
    currentProjectId || ""
  );

  const { data: health, isLoading: healthLoading } = useProjectHealth(
    currentProjectId || ""
  );

  const { data: forecast, isLoading: forecastLoading } = useCompletionForecast(
    currentProjectId || ""
  );

  const { data: sprintReport, isLoading: sprintLoading } = useSprintReport(
    currentProjectId || "",
    sprintStart,
    sprintEnd
  );

  const { data: aiAnalysis, isLoading: aiLoading } = useAIAnalysis(
    currentProjectId || "",
    uid || ""
  );

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
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
      )
      .slice(0, 10);

    return recentTasks.map((task) => {
      const isNew =
        dayjs().diff(dayjs(task.createdAt), "hour") < 24 &&
        task.createdAt === task.updatedAt;
      const isDone = statuses
        .find((s) => s.id === task.statusId)
        ?.name.toLowerCase()
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
    <Tabs
      value={activeTab}
      onChange={(value) => setActiveTab(value || "overview")}
    >
      <Tabs.List>
        <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
          Project Overview
        </Tabs.Tab>
        <Tabs.Tab value="performance" leftSection={<IconChartLine size={16} />}>
          Performance Metrics
        </Tabs.Tab>
        <Tabs.Tab value="sprint" leftSection={<IconCalendar size={16} />}>
          Sprint Report
        </Tabs.Tab>
        <Tabs.Tab value="forecast" leftSection={<IconTarget size={16} />}>
          Forecast
        </Tabs.Tab>
        <Tabs.Tab value="ai" leftSection={<IconBrain size={16} />}>
          AI Analysis
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview" pt="xl">
        <Box>
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

          <Grid gutter="lg" mb="xl">
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
                  {teamWorkloadData.length > 0 ? (
                    <Stack gap="md">
                      {teamWorkloadData.map((member) => (
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
        </Box>
      </Tabs.Panel>

      <Tabs.Panel value="performance" pt="xl">
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {healthLoading ? (
              <>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Loader size="sm" />
                </Card>
              </>
            ) : health ? (
              <>
                <HealthCard
                  title="Overall Health"
                  value={health.overallHealth}
                />
                <HealthCard
                  title="Schedule Status"
                  value={health.schedule.status}
                  subtitle={`SPI: ${(
                    health.schedule.schedulePerformanceIndex * 100
                  ).toFixed(0)}%`}
                />
                <HealthCard
                  title="Resource Utilization"
                  value={`${(health.resources.utilizationRate * 100).toFixed(
                    0
                  )}%`}
                />
                <HealthCard
                  title="Quality Metrics"
                  value={`${(health.quality.defectRate * 100).toFixed(
                    1
                  )}% defect rate`}
                />
              </>
            ) : null}
          </SimpleGrid>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4}>Velocity Metrics</Title>
                {velocity?.trend && (
                  <Badge
                    color={
                      velocity.trend === "increasing"
                        ? "green"
                        : velocity.trend === "decreasing"
                        ? "red"
                        : "blue"
                    }
                    variant="light"
                    leftSection={
                      velocity.trend === "increasing" ? (
                        <IconTrendingUp size={14} />
                      ) : velocity.trend === "decreasing" ? (
                        <IconTrendingDown size={14} />
                      ) : (
                        <IconActivity size={14} />
                      )
                    }
                  >
                    {velocity.trend}
                  </Badge>
                )}
              </Group>

              {velocity && (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                  <MetricCard
                    label="Average Velocity"
                    value={velocity.averageVelocity.toFixed(1)}
                    unit="story points"
                  />
                  <MetricCard
                    label="Std Deviation"
                    value={velocity.standardDeviation.toFixed(1)}
                  />
                  <MetricCard
                    label="Minimum"
                    value={velocity.minimum.toFixed(1)}
                  />
                  <MetricCard
                    label="Maximum"
                    value={velocity.maximum.toFixed(1)}
                  />
                </SimpleGrid>
              )}
            </Stack>
          </Card>

          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            {health && (
              <>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Title order={4}>Quality Metrics</Title>
                    <Group justify="space-around">
                      <RingProgress
                        size={120}
                        thickness={12}
                        sections={[
                          {
                            value: (1 - health.quality.defectRate) * 100,
                            color: "green",
                          },
                        ]}
                        label={
                          <Text size="xs" ta="center" fw={700}>
                            {((1 - health.quality.defectRate) * 100).toFixed(0)}
                            %
                            <br />
                            Quality
                          </Text>
                        }
                      />
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">
                          Defect Rate:{" "}
                          <Text
                            span
                            fw={600}
                            c={
                              health.quality.defectRate < 0.05 ? "green" : "red"
                            }
                          >
                            {(health.quality.defectRate * 100).toFixed(1)}%
                          </Text>
                        </Text>
                        <Text size="sm" c="dimmed">
                          Rework:{" "}
                          <Text
                            span
                            fw={600}
                            c={
                              health.quality.reworkPercentage < 0.1
                                ? "green"
                                : "orange"
                            }
                          >
                            {(health.quality.reworkPercentage * 100).toFixed(1)}
                            %
                          </Text>
                        </Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Title order={4}>Bottlenecks</Title>
                    {health.resources.bottlenecks.length === 0 ? (
                      <Text size="sm" c="dimmed">
                        No bottlenecks detected
                      </Text>
                    ) : (
                      <Stack gap="xs">
                        {health.resources.bottlenecks.map((bottleneck, idx) => (
                          <Paper key={idx} p="sm" withBorder>
                            <Text size="sm">{bottleneck}</Text>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              </>
            )}
          </SimpleGrid>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="sprint" pt="xl">
        <Stack gap="lg">
          <Group>
            <Select
              label="Sprint Start"
              value={sprintStart}
              onChange={(value) => setSprintStart(value || "")}
              data={[
                {
                  value: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
                  label: "30 days ago",
                },
                {
                  value: dayjs().subtract(14, "day").format("YYYY-MM-DD"),
                  label: "14 days ago",
                },
                {
                  value: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
                  label: "7 days ago",
                },
              ]}
            />
            <Select
              label="Sprint End"
              value={sprintEnd}
              onChange={(value) => setSprintEnd(value || "")}
              data={[
                { value: dayjs().format("YYYY-MM-DD"), label: "Today" },
                {
                  value: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
                  label: "Yesterday",
                },
              ]}
            />
          </Group>

          {sprintReport && (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                <MetricCard
                  label="Total Story Points"
                  value={sprintReport.totalStoryPoints.toString()}
                  icon={<IconTarget size={20} />}
                />
                <MetricCard
                  label="Completed"
                  value={sprintReport.completedStoryPoints.toString()}
                  icon={<IconActivity size={20} />}
                />
                <MetricCard
                  label="Completion Rate"
                  value={`${sprintReport.completionPercentage.toFixed(0)}%`}
                />
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="xs" c="dimmed">
                      Health Status
                    </Text>
                    <Badge
                      size="lg"
                      color={
                        sprintReport.health === "healthy"
                          ? "green"
                          : sprintReport.health === "at-risk"
                          ? "yellow"
                          : "red"
                      }
                    >
                      {sprintReport.health}
                    </Badge>
                  </Stack>
                </Card>
              </SimpleGrid>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>Burndown Chart</Title>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={sprintReport.burndownChart}>
                      <defs>
                        <linearGradient
                          id="colorIdeal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#228be6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#228be6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorActual"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#40c057"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#40c057"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => dayjs(value).format("MMM DD")}
                      />
                      <YAxis />
                      <RechartsTooltip
                        labelFormatter={(value) =>
                          dayjs(value).format("MMM DD, YYYY")
                        }
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="idealRemaining"
                        stroke="#0073EA"
                        fill="url(#colorIdeal)"
                        name="Ideal Remaining"
                      />
                      <Area
                        type="monotone"
                        dataKey="actualRemaining"
                        stroke="#00CA72"
                        fill="url(#colorActual)"
                        name="Actual Remaining"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Stack>
              </Card>
            </>
          )}
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="forecast" pt="xl">
        {forecast && (
          <Stack gap="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group>
                  <IconClock size={24} />
                  <Title order={4}>Completion Probability</Title>
                </Group>
                <Text size="sm" c="dimmed">
                  Forecast Date:{" "}
                  <Text span fw={600}>
                    {dayjs(forecast.forecastDate).format("MMMM D, YYYY")}
                  </Text>
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <Paper p="md" withBorder>
                    <Stack gap="xs">
                      <Text size="xs" c="dimmed">
                        15th Percentile
                      </Text>
                      <Text size="xl" fw={700} c="green">
                        {forecast.probabilityOfCompletion.fifthPercentile} days
                      </Text>
                      <Text size="xs" c="dimmed">
                        Best case scenario
                      </Text>
                    </Stack>
                  </Paper>
                  <Paper p="md" withBorder>
                    <Stack gap="xs">
                      <Text size="xs" c="dimmed">
                        50th Percentile
                      </Text>
                      <Text size="xl" fw={700} c="blue">
                        {forecast.probabilityOfCompletion.fiftiethPercentile}{" "}
                        days
                      </Text>
                      <Text size="xs" c="dimmed">
                        Most likely
                      </Text>
                    </Stack>
                  </Paper>
                  <Paper p="md" withBorder>
                    <Stack gap="xs">
                      <Text size="xs" c="dimmed">
                        85th Percentile
                      </Text>
                      <Text size="xl" fw={700} c="orange">
                        {forecast.probabilityOfCompletion.eightyFifthPercentile}{" "}
                        days
                      </Text>
                      <Text size="xs" c="dimmed">
                        Conservative estimate
                      </Text>
                    </Stack>
                  </Paper>
                </SimpleGrid>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={4}>Risk Mitigation</Title>
                <Stack gap="xs">
                  {forecast.recommendedRiskMitigation.map((risk, idx) => (
                    <Paper key={idx} p="sm" withBorder>
                      <Group>
                        <ThemeIcon color="orange" variant="light" size="sm">
                          {idx + 1}
                        </ThemeIcon>
                        <Text size="sm">{risk}</Text>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Stack>
        )}
      </Tabs.Panel>

      <Tabs.Panel value="ai" pt="xl">
        {aiAnalysis ? (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group>
                <IconBrain size={24} />
                <Title order={4}>AI-Powered Analysis</Title>
              </Group>
              <Markdown remarkPlugins={[remarkGfm]}>
                {aiAnalysis.analysis}
              </Markdown>
              <Text size="xs" c="dimmed">
                Thread ID: {aiAnalysis.threadId}
              </Text>
            </Stack>
          </Card>
        ) : (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="No Analysis Available"
            color="blue"
          >
            AI analysis will appear here once data is processed.
          </Alert>
        )}
      </Tabs.Panel>
    </Tabs>
  );
};

function HealthCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  const getColor = (val: string) => {
    if (val.includes("healthy") || val.includes("on-track")) return "green";
    if (val.includes("at-risk")) return "yellow";
    if (val.includes("critical")) return "red";
    return "blue";
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Text size="xs" c="dimmed">
          {title}
        </Text>
        <Badge size="lg" color={getColor(value)}>
          {value}
        </Badge>
        {subtitle && (
          <Text size="xs" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs">
        {icon && <ThemeIcon variant="light">{icon}</ThemeIcon>}
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="xl" fw={700}>
          {value}
        </Text>
        {unit && (
          <Text size="xs" c="dimmed">
            {unit}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

export default Summary;
