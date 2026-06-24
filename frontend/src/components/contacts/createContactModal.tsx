import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ICreateContactPayload, IScoreResult, IContact } from "@/types/contact";
import { useCreateContact, useExtractContact, useScoreContact } from "@/hooks/useContacts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ICreateContactModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (contact: IContact) => void;
}

export function CreateContactModal({ open, onClose, onCreated }: ICreateContactModalProps) {
  const createContact = useCreateContact();
  const extractContact = useExtractContact();
  const scoreContact = useScoreContact();
  const [rawText, setRawText] = useState("");
  const [scoreResult, setScoreResult] = useState<IScoreResult | null>(null);
  const [scoreError, setScoreError] = useState(false);
  const [alreadyContacted, setAlreadyContacted] = useState(false);

  const { register, handleSubmit, reset, setValue, getValues } = useForm<ICreateContactPayload>();

  const handleClose = () => {
    reset();
    setRawText("");
    setScoreResult(null);
    setScoreError(false);
    setAlreadyContacted(false);
    onClose();
  };

  const handleAlreadyContactedToggle = () => {
    const next = !alreadyContacted;
    setAlreadyContacted(next);
    if (next) {
      setValue("status", "contacted");
    } else {
      setValue("status", "to_contact");
      setValue("contactedAt", "");
    }
  };

  const handleExtract = () => {
    setScoreResult(null);
    setScoreError(false);
    extractContact.mutate(rawText, {
      onSuccess: (data) => {
        if (data.name) setValue("name", data.name);
        if (data.company) setValue("company", data.company);
        if (data.linkedinUrl) setValue("linkedinUrl", data.linkedinUrl);
        if (data.jobTitle) setValue("jobTitle", data.jobTitle);

        if (!data.name) return;

        scoreContact.mutate(
          {
            name: data.name,
            jobTitle: data.jobTitle ?? undefined,
            company: data.company ?? undefined,
          },
          {
            onSuccess: (result) => {
              setScoreResult(result);
              // if (result.compatible) {
              //   createContact.mutate(getValues(), { onSuccess: handleClose })
              // }
            },
            onError: () => setScoreError(true),
          },
        );
      },
    });
  };

  const onSubmit = handleSubmit((data) => {
    createContact.mutate(data, { onSuccess: (contact) => { onCreated(contact); handleClose(); } });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un contact</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-rawText">Coller un profil LinkedIn</Label>
          <textarea
            id="create-rawText"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={4}
            placeholder="Colle ici le texte copié depuis un profil LinkedIn..."
            className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleExtract}
            disabled={!rawText.trim() || extractContact.isPending || scoreContact.isPending}
            className="self-end"
          >
            {extractContact.isPending ? "Extraction…" : "Extraire les infos"}
          </Button>
        </div>

        {scoreContact.isPending && (
          <div className="animate-pulse rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            Analyse du profil en cours…
          </div>
        )}

        {scoreError && (
          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            Analyse indisponible. Tu peux ajouter le contact manuellement.
          </div>
        )}

        {scoreResult?.compatible && (
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
            <p className="font-semibold">Profil compatible</p>
            <ul className="mt-1 list-disc list-inside">
              {scoreResult.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {scoreResult && !scoreResult.compatible && (
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
            <p className="font-semibold">Profil non compatible</p>
            <ul className="mt-1 list-disc list-inside">
              {scoreResult.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={createContact.isPending}
                onClick={() => createContact.mutate(getValues(), { onSuccess: (contact) => { onCreated(contact); handleClose(); } })}
              >
                {createContact.isPending ? "Ajout…" : "Ajouter quand même"}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-name">Nom *</Label>
            <Input id="create-name" {...register("name", { required: true })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-jobTitle">Poste</Label>
            <Input id="create-jobTitle" {...register("jobTitle")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-company">Entreprise</Label>
            <Input id="create-company" {...register("company")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-linkedinUrl">URL LinkedIn</Label>
            <Input id="create-linkedinUrl" type="url" {...register("linkedinUrl")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-notes">Notes</Label>
            <textarea
              id="create-notes"
              {...register("notes")}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alreadyContacted}
                onChange={handleAlreadyContactedToggle}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm">J'ai déjà contacté cette personne</span>
            </label>
            {alreadyContacted && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-contactedAt">Date d'envoi</Label>
                <Input
                  id="create-contactedAt"
                  type="date"
                  {...register("contactedAt", { required: alreadyContacted })}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            {scoreResult && (
              <Button
                type="button"
                disabled={createContact.isPending}
                onClick={() => createContact.mutate(getValues(), { onSuccess: (contact) => { onCreated(contact); handleClose(); } })}
              >
                {createContact.isPending ? "Ajout…" : scoreResult.compatible ? "Ajouter" : "Ajouter quand même"}
              </Button>
            )}
            {((!scoreContact.isPending && !scoreResult) || scoreError) && (
              <Button type="submit" disabled={createContact.isPending}>
                {createContact.isPending ? "Création…" : "Créer"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

CreateContactModal.displayName = "CreateContactModal";
