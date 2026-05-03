import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import { Button, Stack } from "@mui/material";
import { useState } from "react";
import { BarberFormDialog } from "../components/barbers/BarberFormDialog";
import { BarbersGrid } from "../components/barbers/BarbersGrid";
import { DeleteBarberDialog } from "../components/barbers/DeleteBarberDialog";
import { PageHeader } from "../components/common/PageHeader";
import { BarberFormPayload, BarberProfile } from "../types";

interface BarbersPageProps {
  items: BarberProfile[];
  telegramBotUsername?: string;
  onCreateBarber: (payload: BarberFormPayload) => Promise<void>;
  onUpdateBarber: (barberId: string, payload: BarberFormPayload) => Promise<void>;
  onDeleteBarber: (barberId: string) => Promise<void>;
  onUploadMedia: (file: File) => Promise<string>;
}

export function BarbersPage({
  items,
  telegramBotUsername,
  onCreateBarber,
  onUpdateBarber,
  onDeleteBarber,
  onUploadMedia,
}: BarbersPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<BarberProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BarberProfile | null>(null);

  const closeFormDialog = () => {
    setDialogOpen(false);
    setSelectedBarber(null);
    setFormMode("add");
  };

  const handleFormSubmit = async (payload: BarberFormPayload) => {
    if (formMode === "edit" && selectedBarber) {
      await onUpdateBarber(selectedBarber.id, payload);
      return;
    }

    await onCreateBarber(payload);
  };

  const handleEdit = (barber: BarberProfile) => {
    setSelectedBarber(barber);
    setFormMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    await onDeleteBarber(deleteTarget.id);
    setExpandedId((current) => (current === deleteTarget.id ? null : current));
    setDeleteTarget(null);
  };

  return (
    <Stack spacing={2.4}>
      <PageHeader
        title="Barberlar"
        subtitle={`Jamoada ${items.length} nafar barber bor`}
        icon={<Groups2RoundedIcon sx={{ fontSize: "1.2rem" }} />}
        eyebrow="Admin paneli"
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setFormMode("add");
              setSelectedBarber(null);
              setDialogOpen(true);
            }}
            sx={{
              width: { xs: "100%", sm: "auto" },
              px: 2.5,
              py: 1.25,
              borderRadius: "18px",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Barber qo'shish
          </Button>
        }
      />

      <BarbersGrid
        items={items}
        telegramBotUsername={telegramBotUsername}
        expandedId={expandedId}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onToggleExpand={(barberId) =>
          setExpandedId((current) => (current === barberId ? null : barberId))
        }
      />

      <BarberFormDialog
        open={dialogOpen}
        mode={formMode}
        onClose={closeFormDialog}
        onSubmit={handleFormSubmit}
        onUploadMedia={onUploadMedia}
        initialBarber={selectedBarber}
      />

      <DeleteBarberDialog
        open={Boolean(deleteTarget)}
        barber={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Stack>
  );
}
