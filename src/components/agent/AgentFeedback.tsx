"use client";
import { useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Textarea,
  Paper,
  Rating,
  Badge,
  ActionIcon,
  Collapse,
  Box,
  ThemeIcon,
  Progress,
  Title,
  Divider,
} from "@mantine/core";
import {
  IconStar,
  IconStarFilled,
  IconThumbUp,
  IconThumbDown,
  IconSparkles,
  IconMessageCircle,
  IconSend,
  IconX,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

import { FeedbackAction } from "@/types/api";
import { useSubmitFeedback } from "@/hooks/recommendations";

interface AgentSuggestion {
  id: string;
  type: "task" | "subtask" | "project";
  content: string;
  context?: string;
}

interface AgentFeedbackProps {
  opened: boolean;
  onClose: () => void;
  suggestion: AgentSuggestion;
  onSubmitFeedback?: (feedback: FeedbackData) => void;
}

interface FeedbackData {
  suggestionId: string;
  rating: number;
  helpful: boolean | null;
  comment: string;
  improvements: string[];
  timestamp: string;
}

const quickFeedbackOptions = [
  { id: "accurate", label: "Accurate", icon: "✓" },
  { id: "relevant", label: "Relevant", icon: "🎯" },
  { id: "helpful", label: "Helpful", icon: "💡" },
  { id: "creative", label: "Creative", icon: "✨" },
  { id: "time-saving", label: "Time-saving", icon: "⏱️" },
  { id: "too-generic", label: "Too generic", icon: "📋" },
  { id: "missing-context", label: "Missing context", icon: "❓" },
  { id: "incorrect", label: "Incorrect", icon: "✗" },
];

export default function AgentFeedback({
  opened,
  onClose,
  suggestion,
  onSubmitFeedback,
}: AgentFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>(
    []
  );
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const submitFeedbackMutation = useSubmitFeedback();

  const toggleImprovement = (improvementId: string) => {
    setSelectedImprovements((prev) =>
      prev.includes(improvementId)
        ? prev.filter((id) => id !== improvementId)
        : [...prev, improvementId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      notifications.show({
        title: "Rating Required",
        message: "Please provide a rating before submitting",
        color: "orange",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      suggestionId: suggestion.id,
      rating,
      helpful,
      comment: comment.trim(),
      improvements: selectedImprovements,
      timestamp: new Date().toISOString(),
    };

    try {
      const feedbackAction =
        suggestion.context === "reject"
          ? FeedbackAction.REJECTED
          : FeedbackAction.ACCEPTED;

      await submitFeedbackMutation.mutateAsync({
        id: suggestion.id,
        dto: {
          action: feedbackAction,
          starRating: rating,
          comment: comment.trim() || undefined,
          helpfulnessRating: rating,
          accuracyRating: rating,
          relevanceRating: rating,
        },
      });

      if (onSubmitFeedback) {
        onSubmitFeedback(feedbackData);
      }

      setHasSubmitted(true);

      notifications.show({
        title: "Thank you for your feedback! 🎉",
        message: "Your input helps improve our AI suggestions",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to submit feedback. Please try again.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHelpful(null);
    setComment("");
    setSelectedImprovements([]);
    setShowDetailedForm(false);
    setHasSubmitted(false);
    onClose();
  };

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "";
    }
  };

  const getRatingColor = (value: number) => {
    if (value <= 2) return "red";
    if (value === 3) return "yellow";
    return "green";
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <ThemeIcon color="violet" variant="light" size="lg" radius="xl">
            <IconSparkles size={20} />
          </ThemeIcon>
          <div>
            <Title order={4}>How was this AI suggestion?</Title>
            <Text size="xs" c="dimmed">
              Your feedback helps improve future suggestions
            </Text>
          </div>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={!hasSubmitted}
    >
      {hasSubmitted ? (
        // Success State
        <Stack gap="xl" align="center" py="xl">
          <ThemeIcon color="green" variant="light" size={80} radius="xl">
            <IconCheck size={40} />
          </ThemeIcon>
          <Stack gap="xs" align="center">
            <Text size="xl" fw={700}>
              Thank you!
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Your feedback has been recorded and will help us improve
            </Text>
          </Stack>
          <Progress value={100} color="green" size="sm" w="100%" animated />
        </Stack>
      ) : (
        <Stack gap="lg">
          {/* Suggestion Preview */}
          <Paper p="md" withBorder radius="md" bg="var(--monday-bg-tertiary)">
            <Group gap="xs" mb="xs">
              <Badge size="sm">
                {suggestion?.type?.toUpperCase() || "N/A"}
              </Badge>
              <Text size="xs">AI Suggestion</Text>
            </Group>
            <Text size="sm" lineClamp={3}>
              {suggestion.content}
            </Text>
          </Paper>

          {/* Rating Section */}
          <>
            <Divider />
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={600}>
                  Rate this suggestion
                </Text>
                {rating > 0 && (
                  <Badge color={getRatingColor(rating)} variant="light">
                    {getRatingLabel(rating)}
                  </Badge>
                )}
              </Group>
              <Group gap="xs" justify="center">
                <Rating
                  value={rating}
                  onChange={setRating}
                  size="xl"
                  emptySymbol={<IconStar size={32} />}
                  fullSymbol={<IconStarFilled size={32} />}
                />
              </Group>
            </Stack>
          </>

          {/* Quick Feedback Tags */}
          {rating > 0 && (
            <>
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600}>
                    Quick feedback (optional)
                  </Text>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => setShowDetailedForm(!showDetailedForm)}
                    rightSection={
                      showDetailedForm ? (
                        <IconX size={14} />
                      ) : (
                        <IconMessageCircle size={14} />
                      )
                    }
                  >
                    {showDetailedForm ? "Hide" : "Add detailed feedback"}
                  </Button>
                </Group>
                <Group gap="xs">
                  {quickFeedbackOptions.map((option) => (
                    <Badge
                      key={option.id}
                      variant={
                        selectedImprovements.includes(option.id)
                          ? "filled"
                          : "outline"
                      }
                      color="blue"
                      size="lg"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleImprovement(option.id)}
                      leftSection={<span>{option.icon}</span>}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </Group>
              </Stack>

              {/* Detailed Feedback Form */}
              <Collapse in={showDetailedForm}>
                <Stack gap="sm">
                  <Textarea
                    label="Additional comments"
                    placeholder="Tell us more about your experience with this suggestion..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    leftSection={<IconMessageCircle size={16} />}
                  />
                  <Text size="xs" c="dimmed">
                    Your detailed feedback helps us train better AI models
                  </Text>
                </Stack>
              </Collapse>
            </>
          )}

          {/* Action Buttons */}
          {rating > 0 && (
            <>
              <Divider />
              <Group justify="space-between">
                <Button variant="subtle" onClick={handleClose}>
                  Skip
                </Button>
                <Button
                  leftSection={<IconSend size={16} />}
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  color="violet"
                >
                  Submit Feedback
                </Button>
              </Group>
            </>
          )}

          {/* Help Text */}
          {rating === 0 && helpful === null && (
            <Box
              p="md"
              bg="var(--monday-bg-tertiary)"
              style={{ borderRadius: "8px" }}
            >
              <Group gap="sm">
                <IconAlertCircle
                  size={20}
                  color="var(--mantine-color-blue-6)"
                />
                <Text size="xs">
                  Your feedback is crucial for improving AI suggestions. Please
                  take a moment to rate this suggestion.
                </Text>
              </Group>
            </Box>
          )}
        </Stack>
      )}
    </Modal>
  );
}
