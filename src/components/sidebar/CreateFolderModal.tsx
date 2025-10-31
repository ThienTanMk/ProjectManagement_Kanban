import { Modal, Stack, TextInput, Group, Button } from "@mantine/core";

interface CreateFolderModalProps {
  opened: boolean;
  newFolderName: string;
  setNewFolderName: (value: string) => void;
  handleCreateFolder: () => void;
  setCreateFolderModalOpened: (value: boolean) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  opened,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  setCreateFolderModalOpened,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={() => {
        setCreateFolderModalOpened(false);
        setNewFolderName("");
      }}
      title="Create New Folder"
      size="sm"
    >
      <Stack>
        <TextInput
          placeholder="Folder name"
          value={newFolderName}
          onChange={(e) => {
            console.log("New folder name:", e.currentTarget.value); // Debug giá trị input
            setNewFolderName(e.currentTarget.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              console.log("Enter pressed, creating folder:", newFolderName); // Debug khi nhấn Enter
              handleCreateFolder();
            }
          }}
        />
        <Group justify="flex-end">
          <Button
            variant="subtle"
            onClick={() => {
              setCreateFolderModalOpened(false);
              setNewFolderName("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log("Create button clicked, folder name:", newFolderName); // Debug khi nhấn Create
              handleCreateFolder();
            }}
            disabled={!newFolderName.trim()}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};