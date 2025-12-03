"use client";
import { useState } from "react";
import {
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
  Skeleton,
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
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
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

export function PerformanceView() {
  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [sprintStart, setSprintStart] = useState<string>(
    dayjs().subtract(14, "day").format("YYYY-MM-DD")
  );
  const [sprintEnd, setSprintEnd] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );

  const {
    data: velocity,
    isLoading: velocityLoading,
    error: velocityError,
  } = useVelocity(currentProjectId || "");

  const {
    data: health,
    isLoading: healthLoading,
    error: healthError,
  } = useProjectHealth(currentProjectId || "");

  const {
    data: forecast,
    isLoading: forecastLoading,
    error: forecastError,
  } = useCompletionForecast(currentProjectId || "");

  const {
    data: sprintReport,
    isLoading: sprintLoading,
    error: sprintError,
  } = useSprintReport(currentProjectId || "", sprintStart, sprintEnd);

  const {
    data: aiAnalysis,
    isLoading: aiLoading,
    error: aiError,
  } = useAIAnalysis(currentProjectId || "", uid || "");

  if (!currentProjectId) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="No Project Selected"
        color="yellow"
      >
        Please select a project to view performance metrics.
      </Alert>
    );
  }

  return (
    <Tabs
      value={activeTab}
      onChange={(value) => setActiveTab(value || "overview")}
    >
      <Tabs.List>
        <Tabs.Tab value="overview" leftSection={<IconChartLine size={16} />}>
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
          {/* Health Cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {healthLoading ? (
              <>
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
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

          {/* Velocity Metrics */}
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              backgroundColor: "var(--monday-bg-secondary)",
              border: "1px solid var(--monday-border-primary)",
            }}
          >
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4} c="var(--monday-text-primary)">
                  Velocity Metrics
                </Title>
                {velocityLoading ? (
                  <Skeleton height={24} width={80} radius="xl" />
                ) : velocity?.trend ? (
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
                ) : null}
              </Group>

              {velocityLoading ? (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                  <Skeleton height={80} radius="md" />
                  <Skeleton height={80} radius="md" />
                  <Skeleton height={80} radius="md" />
                  <Skeleton height={80} radius="md" />
                </SimpleGrid>
              ) : velocity ? (
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
              ) : null}

              {velocity && (
                <Paper p="sm" withBorder>
                  <Text size="sm" c="var(--monday-text-secondary)">
                    Confidence Interval (
                    {velocity.confidenceInterval.confidence}%):{" "}
                    <Text span fw={600} c="var(--monday-text-primary)">
                      {velocity.confidenceInterval.low.toFixed(2)} -{" "}
                      {velocity.confidenceInterval.high.toFixed(2)}
                    </Text>
                  </Text>
                </Paper>
              )}
            </Stack>
          </Card>

          {/* Quality and Bottlenecks */}
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            {healthLoading ? (
              <>
                <Skeleton height={200} radius="md" />
                <Skeleton height={200} radius="md" />
              </>
            ) : health ? (
              <>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "var(--monday-bg-secondary)",
                    border: "1px solid var(--monday-border-primary)",
                  }}
                >
                  <Stack gap="md">
                    <Title order={4} c="var(--monday-text-primary)">
                      Quality Metrics
                    </Title>
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
                          <Text
                            size="xs"
                            ta="center"
                            fw={700}
                            c="var(--monday-text-primary)"
                          >
                            {((1 - health.quality.defectRate) * 100).toFixed(0)}
                            %
                            <br />
                            Quality
                          </Text>
                        }
                      />
                      <Stack gap="xs">
                        <Text size="sm" c="var(--monday-text-secondary)">
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
                        <Text size="sm" c="var(--monday-text-secondary)">
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

                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "var(--monday-bg-secondary)",
                    border: "1px solid var(--monday-border-primary)",
                  }}
                >
                  <Stack gap="md">
                    <Title order={4} c="var(--monday-text-primary)">
                      Bottlenecks
                    </Title>
                    {health.resources.bottlenecks.length === 0 ? (
                      <Text size="sm" c="var(--monday-text-secondary)">
                        No bottlenecks detected
                      </Text>
                    ) : (
                      <Stack gap="xs">
                        {health.resources.bottlenecks.map((bottleneck, idx) => (
                          <Paper key={idx} p="sm" withBorder>
                            <Text size="sm" c="var(--monday-text-primary)">
                              {bottleneck}
                            </Text>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              </>
            ) : null}
          </SimpleGrid>
        </Stack>
      </Tabs.Panel>

      {/* Sprint Report Tab */}
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

          {sprintLoading ? (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
                <Skeleton height={120} radius="md" />
              </SimpleGrid>
              <Skeleton height={400} radius="md" />
            </>
          ) : sprintReport ? (
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
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    backgroundColor: "var(--monday-bg-secondary)",
                    border: "1px solid var(--monday-border-primary)",
                  }}
                >
                  <Stack gap="xs">
                    <Text size="xs" c="var(--monday-text-secondary)">
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

              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  backgroundColor: "var(--monday-bg-secondary)",
                  border: "1px solid var(--monday-border-primary)",
                }}
              >
                <Stack gap="md">
                  <Title order={4} c="var(--monday-text-primary)">
                    Burndown Chart
                  </Title>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => dayjs(value).format("MMM DD")}
                        stroke="#888"
                      />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1b1e",
                          border: "1px solid #444",
                        }}
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

              <SimpleGrid cols={{ base: 1, lg: 3 }}>
                <MetricCard
                  label="Schedule Performance Index"
                  value={sprintReport.metrics.schedulePerformanceIndex.toFixed(
                    2
                  )}
                />
                <MetricCard
                  label="Scope Changes"
                  value={sprintReport.metrics.scopeChangeCount.toString()}
                />
                <MetricCard
                  label="Blockers"
                  value={sprintReport.metrics.blockerCount.toString()}
                  icon={<IconAlertCircle size={20} />}
                />
              </SimpleGrid>
            </>
          ) : null}
        </Stack>
      </Tabs.Panel>

      {/* Forecast Tab */}
      <Tabs.Panel value="forecast" pt="xl">
        {forecastLoading ? (
          <Stack gap="lg">
            <Skeleton height={200} radius="md" />
            <Skeleton height={300} radius="md" />
          </Stack>
        ) : forecast ? (
          <Stack gap="lg">
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: "var(--monday-bg-secondary)",
                border: "1px solid var(--monday-border-primary)",
              }}
            >
              <Stack gap="md">
                <Group>
                  <IconClock size={24} />
                  <Title order={4} c="var(--monday-text-primary)">
                    Completion Probability
                  </Title>
                </Group>
                <Text size="sm" c="var(--monday-text-secondary)">
                  Forecast Date:{" "}
                  <Text span fw={600} c="var(--monday-text-primary)">
                    {dayjs(forecast.forecastDate).format("MMMM D, YYYY")}
                  </Text>
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 3 }}>
                  <Paper p="md" withBorder>
                    <Stack gap="xs">
                      <Text size="xs" c="var(--monday-text-secondary)">
                        15th Percentile
                      </Text>
                      <Text size="xl" fw={700} c="green">
                        {forecast.probabilityOfCompletion.fifthPercentile} days
                      </Text>
                      <Text size="xs" c="var(--monday-text-secondary)">
                        Best case scenario
                      </Text>
                    </Stack>
                  </Paper>
                  <Paper p="md" withBorder>
                    <Stack gap="xs">
                      <Text size="xs" c="var(--monday-text-secondary)">
                        50th Percentile
                      </Text>
                      <Text size="xl" fw={700} c="blue">
                        {forecast.probabilityOfCompletion.fiftiethPercentile}{" "}
                        days
                      </Text>
                      <Text size="xs" c="var(--monday-text-secondary)">
                        Most likely
                      </Text>
                    </Stack>
                  </Paper>
                  <Paper p="md" withBorder>
                    <Stack gap="xs">
                      <Text size="xs" c="var(--monday-text-secondary)">
                        85th Percentile
                      </Text>
                      <Text size="xl" fw={700} c="orange">
                        {forecast.probabilityOfCompletion.eightyFifthPercentile}{" "}
                        days
                      </Text>
                      <Text size="xs" c="var(--monday-text-secondary)">
                        Conservative estimate
                      </Text>
                    </Stack>
                  </Paper>
                </SimpleGrid>
              </Stack>
            </Card>

            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: "var(--monday-bg-secondary)",
                border: "1px solid var(--monday-border-primary)",
              }}
            >
              <Stack gap="md">
                <Title order={4} c="var(--monday-text-primary)">
                  Risk Mitigation
                </Title>
                <Stack gap="xs">
                  {forecast.recommendedRiskMitigation.map((risk, idx) => (
                    <Paper key={idx} p="sm" withBorder>
                      <Group>
                        <ThemeIcon color="orange" variant="light" size="sm">
                          {idx + 1}
                        </ThemeIcon>
                        <Text size="sm" c="var(--monday-text-primary)">
                          {risk}
                        </Text>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Card>
          </Stack>
        ) : null}
      </Tabs.Panel>

      {/* AI Analysis Tab */}
      <Tabs.Panel value="ai" pt="xl">
        {aiLoading ? (
          <Stack gap="lg">
            <Skeleton height={80} radius="md" />
            <Skeleton height={400} radius="md" />
          </Stack>
        ) : aiAnalysis ? (
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              backgroundColor: "var(--monday-bg-secondary)",
              border: "1px solid var(--monday-border-primary)",
            }}
          >
            <Stack gap="md">
              <Group>
                <IconBrain size={24} />
                <Title order={4} c="var(--monday-text-primary)">
                  AI-Powered Analysis
                </Title>
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
}

// Helper Components
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
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: "var(--monday-bg-secondary)",
        border: "1px solid var(--monday-border-primary)",
      }}
    >
      <Stack gap="xs">
        <Text size="xs" c="var(--monday-text-secondary)">
          {title}
        </Text>
        <Badge size="lg" color={getColor(value)}>
          {value}
        </Badge>
        {subtitle && (
          <Text size="xs" c="var(--monday-text-secondary)">
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
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: "var(--monday-bg-secondary)",
        border: "1px solid var(--monday-border-primary)",
      }}
    >
      <Stack gap="xs">
        {icon && <ThemeIcon variant="light">{icon}</ThemeIcon>}
        <Text size="xs" c="var(--monday-text-secondary)">
          {label}
        </Text>
        <Text size="xl" fw={700} c="var(--monday-text-primary)">
          {value}
        </Text>
        {unit && (
          <Text size="xs" c="var(--monday-text-secondary)">
            {unit}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
