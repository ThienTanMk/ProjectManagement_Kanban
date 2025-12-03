"use client";
import { useState } from "react";
import {
  Box,
  Card,
  Text,
  Title,
  Badge,
  Stack,
  Group,
  RingProgress,
  Paper,
  ThemeIcon,
  SimpleGrid,
  Tabs,
  Select,
  Loader,
  Alert,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconTarget,
  IconAlertCircle,
  IconChartLine,
  IconCalendar,
  IconUsers,
  IconClock,
  IconBrain,
} from "@tabler/icons-react";
import { useProjectStore } from "@/stores/projectStore";
import {
  useVelocity,
  useProjectHealth,
  useCompletionForecast,
  useSprintReport,
  useAIAnalysis,
} from "@/hooks/performances";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function PerformanceScreen() {
  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();

  // Sprint date range (default: last 14 days)
  const [sprintStartDate, setSprintStartDate] = useState(
    dayjs().subtract(14, "day").format("YYYY-MM-DD")
  );
  const [sprintEndDate, setSprintEndDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  // Fetch data
  const { data: velocity, isLoading: velocityLoading } = useVelocity(
    currentProjectId || ""
  );
  const { data: health, isLoading: healthLoading } = useProjectHealth(
    currentProjectId || ""
  );
  const { data: forecast, isLoading: forecastLoading } = useCompletionForecast(
    currentProjectId || ""
  );
  const { data: sprint, isLoading: sprintLoading } = useSprintReport(
    currentProjectId || "",
    sprintStartDate,
    sprintEndDate
  );
  const { data: aiAnalysis, isLoading: aiLoading } = useAIAnalysis(
    currentProjectId || "",
    uid || ""
  );

  if (!currentProjectId) {
    return (
      <Box p="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="yellow">
          Please select a project to view performance metrics
        </Alert>
      </Box>
    );
  }

  const isLoading =
    velocityLoading ||
    healthLoading ||
    forecastLoading ||
    sprintLoading ||
    aiLoading;

  return (
    <Box p="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>Project Performance</Title>
            <Text c="dimmed" size="sm">
              Comprehensive analytics and insights for your project
            </Text>
          </div>
        </Group>

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab
              value="overview"
              leftSection={<IconChartLine size={16} />}
            >
              Overview
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

          {/* Overview Tab */}
          <Tabs.Panel value="overview" pt="xl">
            <Stack gap="lg">
              {/* Health Status Cards */}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                <HealthCard
                  title="Overall Health"
                  value={health?.overallHealth || "N/A"}
                  loading={healthLoading}
                />
                <HealthCard
                  title="Schedule Status"
                  value={health?.schedule.status || "N/A"}
                  subtitle={
                    health?.schedule.schedulePerformanceIndex
                      ? `SPI: ${health.schedule.schedulePerformanceIndex.toFixed(
                          2
                        )}`
                      : undefined
                  }
                  loading={healthLoading}
                />
                <HealthCard
                  title="High Risks"
                  value={health?.risks.highRiskCount?.toString() || "0"}
                  subtitle={`Total: ${health?.risks.count || 0} risks`}
                  loading={healthLoading}
                />
                <HealthCard
                  title="Utilization"
                  value={
                    health?.resources.utilizationRate
                      ? `${(health.resources.utilizationRate * 100).toFixed(
                          0
                        )}%`
                      : "N/A"
                  }
                  loading={healthLoading}
                />
              </SimpleGrid>

              {/* Velocity Metrics */}
              {velocity && (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Title order={4}>Velocity Metrics</Title>
                      <Badge
                        color={
                          velocity.trend === "increasing"
                            ? "green"
                            : velocity.trend === "decreasing"
                            ? "red"
                            : "blue"
                        }
                        leftSection={
                          velocity.trend === "increasing" ? (
                            <IconTrendingUp size={12} />
                          ) : velocity.trend === "decreasing" ? (
                            <IconTrendingDown size={12} />
                          ) : (
                            <IconActivity size={12} />
                          )
                        }
                      >
                        {velocity.trend}
                      </Badge>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                      <MetricBox
                        label="Average Velocity"
                        value={velocity.averageVelocity.toFixed(1)}
                        unit="pts"
                      />
                      <MetricBox
                        label="Std Deviation"
                        value={velocity.standardDeviation.toFixed(1)}
                        unit="pts"
                      />
                      <MetricBox
                        label="Min / Max"
                        value={`${velocity.minimum.toFixed(
                          0
                        )} / ${velocity.maximum.toFixed(0)}`}
                        unit="pts"
                      />
                      <MetricBox
                        label="Confidence"
                        value={`${velocity.confidenceInterval.low.toFixed(
                          1
                        )} - ${velocity.confidenceInterval.high.toFixed(1)}`}
                        unit="pts"
                      />
                    </SimpleGrid>
                  </Stack>
                </Card>
              )}

              {/* Quality Metrics */}
              {health && (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Title order={4}>Quality Metrics</Title>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                      <MetricBox
                        label="Defect Rate"
                        value={health.quality.defectRate.toFixed(1)}
                        unit="%"
                      />
                      <MetricBox
                        label="Rework"
                        value={health.quality.reworkPercentage.toFixed(1)}
                        unit="%"
                      />
                      <MetricBox
                        label="Risk Materialisation"
                        value={health.risks.materialisationRate.toFixed(1)}
                        unit="%"
                      />
                    </SimpleGrid>
                  </Stack>
                </Card>
              )}

              {/* Resource Bottlenecks */}
              {health?.resources.bottlenecks &&
                health.resources.bottlenecks.length > 0 && (
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Group>
                        <IconUsers size={20} />
                        <Title order={4}>Resource Bottlenecks</Title>
                      </Group>
                      <Stack gap="xs">
                        {health.resources.bottlenecks.map((bottleneck, idx) => (
                          <Badge
                            key={idx}
                            color="orange"
                            variant="light"
                            size="lg"
                          >
                            {bottleneck}
                          </Badge>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                )}
            </Stack>
          </Tabs.Panel>

          {/* Sprint Report Tab */}
          <Tabs.Panel value="sprint" pt="xl">
            <Stack gap="lg">
              {/* Date Range Selector */}
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Group>
                  <Select
                    label="Quick Select"
                    placeholder="Choose period"
                    data={[
                      { value: "7", label: "Last 7 days" },
                      { value: "14", label: "Last 14 days" },
                      { value: "30", label: "Last 30 days" },
                    ]}
                    onChange={(value) => {
                      if (value) {
                        setSprintStartDate(
                          dayjs()
                            .subtract(parseInt(value), "day")
                            .format("YYYY-MM-DD")
                        );
                        setSprintEndDate(dayjs().format("YYYY-MM-DD"));
                      }
                    }}
                    style={{ width: 200 }}
                  />
                  <Text c="dimmed" size="sm">
                    {dayjs(sprintStartDate).format("MMM DD")} -{" "}
                    {dayjs(sprintEndDate).format("MMM DD, YYYY")}
                  </Text>
                </Group>
              </Card>

              {sprintLoading && <Loader />}

              {sprint && (
                <>
                  {/* Sprint Overview */}
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Stack gap="xs" align="center">
                        <ThemeIcon
                          size={50}
                          radius="md"
                          variant="light"
                          color="blue"
                        >
                          <IconTarget size={30} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" tt="uppercase">
                          Total Story Points
                        </Text>
                        <Text size="xl" fw={700}>
                          {sprint.totalStoryPoints}
                        </Text>
                      </Stack>
                    </Card>

                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Stack gap="xs" align="center">
                        <ThemeIcon
                          size={50}
                          radius="md"
                          variant="light"
                          color="green"
                        >
                          <IconActivity size={30} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" tt="uppercase">
                          Completed
                        </Text>
                        <Text size="xl" fw={700}>
                          {sprint.completedStoryPoints}
                        </Text>
                      </Stack>
                    </Card>

                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Stack gap="xs" align="center">
                        <RingProgress
                          size={80}
                          thickness={8}
                          sections={[
                            {
                              value: sprint.completionPercentage,
                              color:
                                sprint.completionPercentage >= 70
                                  ? "green"
                                  : sprint.completionPercentage >= 40
                                  ? "yellow"
                                  : "red",
                            },
                          ]}
                          label={
                            <Text size="xs" ta="center" fw={700}>
                              {sprint.completionPercentage.toFixed(0)}%
                            </Text>
                          }
                        />
                        <Text size="xs" c="dimmed" tt="uppercase">
                          Completion
                        </Text>
                      </Stack>
                    </Card>

                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Stack gap="xs" align="center">
                        <Badge
                          size="xl"
                          color={
                            sprint.health === "healthy"
                              ? "green"
                              : sprint.health === "at-risk"
                              ? "yellow"
                              : "red"
                          }
                          variant="filled"
                        >
                          {sprint.health.toUpperCase()}
                        </Badge>
                        <Text size="xs" c="dimmed" tt="uppercase">
                          Sprint Health
                        </Text>
                      </Stack>
                    </Card>
                  </SimpleGrid>

                  {/* Burndown Chart */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Title order={4}>Burndown Chart</Title>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={sprint.burndownChart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(val) => dayjs(val).format("MMM DD")}
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={(val) =>
                              dayjs(val).format("MMM DD, YYYY")
                            }
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="idealRemaining"
                            stroke="#868e96"
                            fill="#868e96"
                            fillOpacity={0.2}
                            name="Ideal"
                          />
                          <Area
                            type="monotone"
                            dataKey="actualRemaining"
                            stroke="#228be6"
                            fill="#228be6"
                            fillOpacity={0.3}
                            name="Actual"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Stack>
                  </Card>

                  {/* Sprint Metrics */}
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Title order={4}>Sprint Metrics</Title>
                      <SimpleGrid cols={{ base: 1, sm: 3 }}>
                        <MetricBox
                          label="Schedule Performance"
                          value={sprint.metrics.schedulePerformanceIndex.toFixed(
                            2
                          )}
                          unit="SPI"
                        />
                        <MetricBox
                          label="Scope Changes"
                          value={sprint.metrics.scopeChangeCount.toString()}
                          unit="changes"
                        />
                        <MetricBox
                          label="Blockers"
                          value={sprint.metrics.blockerCount.toString()}
                          unit="items"
                        />
                      </SimpleGrid>
                    </Stack>
                  </Card>
                </>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Forecast Tab */}
          <Tabs.Panel value="forecast" pt="xl">
            {forecastLoading && <Loader />}

            {forecast && (
              <Stack gap="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Group>
                      <IconClock size={24} />
                      <div>
                        <Title order={4}>Completion Forecast</Title>
                        <Text size="sm" c="dimmed">
                          Predicted:{" "}
                          {dayjs(forecast.forecastDate).format("MMM DD, YYYY")}
                        </Text>
                      </div>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 3 }}>
                      <Paper p="md" withBorder>
                        <Stack gap="xs" align="center">
                          <Text size="xs" c="dimmed">
                            5th Percentile (Optimistic)
                          </Text>
                          <Text size="xl" fw={700} c="green">
                            {(
                              forecast.probabilityOfCompletion.fifthPercentile *
                              100
                            ).toFixed(0)}
                            %
                          </Text>
                        </Stack>
                      </Paper>
                      <Paper p="md" withBorder>
                        <Stack gap="xs" align="center">
                          <Text size="xs" c="dimmed">
                            50th Percentile (Likely)
                          </Text>
                          <Text size="xl" fw={700} c="blue">
                            {(
                              forecast.probabilityOfCompletion
                                .fiftiethPercentile * 100
                            ).toFixed(0)}
                            %
                          </Text>
                        </Stack>
                      </Paper>
                      <Paper p="md" withBorder>
                        <Stack gap="xs" align="center">
                          <Text size="xs" c="dimmed">
                            85th Percentile (Conservative)
                          </Text>
                          <Text size="xl" fw={700} c="orange">
                            {(
                              forecast.probabilityOfCompletion
                                .eightyFifthPercentile * 100
                            ).toFixed(0)}
                            %
                          </Text>
                        </Stack>
                      </Paper>
                    </SimpleGrid>
                  </Stack>
                </Card>

                {/* Risk Mitigation */}
                {forecast.recommendedRiskMitigation.length > 0 && (
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack gap="md">
                      <Group>
                        <IconAlertCircle size={20} />
                        <Title order={4}>Recommended Risk Mitigation</Title>
                      </Group>
                      <Stack gap="xs">
                        {forecast.recommendedRiskMitigation.map((risk, idx) => (
                          <Paper key={idx} p="sm" withBorder>
                            <Text size="sm">{risk}</Text>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </Stack>
            )}
          </Tabs.Panel>

          {/* AI Analysis Tab */}
          <Tabs.Panel value="ai" pt="xl">
            {aiLoading && <Loader />}

            {aiAnalysis && (
              <Stack gap="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="md">
                    <Group>
                      <IconBrain size={24} />
                      <Title order={4}>AI-Powered Analysis</Title>
                    </Group>
                    <Text style={{ whiteSpace: "pre-wrap" }}>
                      {aiAnalysis.analysis}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Thread ID: {aiAnalysis.threadId}
                    </Text>
                  </Stack>
                </Card>
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Box>
  );
}

// Helper Components
function HealthCard({
  title,
  value,
  subtitle,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  loading?: boolean;
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
        <Text size="xs" c="dimmed" tt="uppercase">
          {title}
        </Text>
        {loading ? (
          <Loader size="sm" />
        ) : (
          <>
            <Badge color={getColor(value)} size="lg" variant="light">
              {value}
            </Badge>
            {subtitle && (
              <Text size="xs" c="dimmed">
                {subtitle}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}

function MetricBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <Paper p="md" withBorder>
      <Stack gap={4}>
        <Text size="xs" c="dimmed" tt="uppercase">
          {label}
        </Text>
        <Group gap={4} align="baseline">
          <Text size="xl" fw={700}>
            {value}
          </Text>
          {unit && (
            <Text size="sm" c="dimmed">
              {unit}
            </Text>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
