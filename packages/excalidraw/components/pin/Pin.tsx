import React from "react";
import clsx from "clsx";

import type { Zoom } from "../../types";
import { sceneCoordsToViewportCoords } from "@excalidraw/common";

import { t } from "../../i18n";
import { CloseIcon } from "../icons";

import type { Pin, PinId, PinDialogState, PinMap } from "../../pins/types";

import "./Pin.scss";

interface PinComponentProps {
  pin: Pin;
  isSelected: boolean;
  onClick: (pinId: PinId) => void;
  appState: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
  };
}

export const PinComponent = ({
  pin,
  isSelected,
  onClick,
  appState,
}: PinComponentProps) => {
  const { x: viewportX, y: viewportY } = sceneCoordsToViewportCoords(
    { sceneX: pin.x, sceneY: pin.y },
    appState,
  );

  const hasContent = pin.content.trim().length > 0;

  return (
    <div
      className={clsx("excalidraw-pin", {
        "has-content": hasContent,
        selected: isSelected,
      })}
      style={{
        left: viewportX,
        top: viewportY,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(pin.id);
      }}
    >
      <div className="excalidraw-pin__head">
        <div className="excalidraw-pin__dot" />
      </div>
      <div className="excalidraw-pin__tail" />
    </div>
  );
};

interface PinDialogProps {
  pin: Pin;
  isEditing: boolean;
  isNew: boolean;
  onSave: (pinId: PinId, content: string) => void;
  onDelete: (pinId: PinId) => void;
  onClose: (pinId: PinId, currentContent: string, isNew: boolean) => void;
  onEdit: (pinId: PinId) => void;
  appState: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
    width: number;
    height: number;
  };
}

const DIALOG_WIDTH = 280;
const DIALOG_MARGIN = 16;
const PIN_OFFSET_Y = 40;

export const PinDialog = ({
  pin,
  isEditing,
  isNew,
  onSave,
  onDelete,
  onClose,
  onEdit,
  appState,
}: PinDialogProps) => {
  const [content, setContent] = React.useState(pin.content);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(pin.id, content);
  };

  const handleClose = () => {
    onClose(pin.id, content, isNew);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      handleClose();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (isEditing) {
        handleSave();
      }
    }
  };

  const { x: viewportX, y: viewportY } = sceneCoordsToViewportCoords(
    { sceneX: pin.x, sceneY: pin.y },
    appState,
  );

  let dialogX = viewportX - DIALOG_WIDTH / 2;
  let dialogY = viewportY + PIN_OFFSET_Y;

  if (dialogX < DIALOG_MARGIN) {
    dialogX = DIALOG_MARGIN;
  } else if (dialogX + DIALOG_WIDTH > appState.width - DIALOG_MARGIN) {
    dialogX = appState.width - DIALOG_WIDTH - DIALOG_MARGIN;
  }

  if (dialogY + 200 > appState.height - DIALOG_MARGIN) {
    dialogY = viewportY - PIN_OFFSET_Y - 200;
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div
      className="excalidraw-pin-dialog"
      style={{
        left: dialogX,
        top: dialogY,
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="excalidraw-pin-dialog__header">
        <h3 className="excalidraw-pin-dialog__title">
          {t("labels.comment")}
        </h3>
        <button
          className="excalidraw-pin-dialog__close"
          onClick={handleClose}
          type="button"
          aria-label={t("buttons.close")}
        >
          {CloseIcon}
        </button>
      </div>

      <div className="excalidraw-pin-dialog__content">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="excalidraw-pin-dialog__textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("labels.commentPlaceholder")}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="excalidraw-pin-dialog__content-text">
            {pin.content || (
              <span style={{ color: "var(--color-gray-5)" }}>
                {t("labels.noComment")}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="excalidraw-pin-dialog__footer">
        <span className="excalidraw-pin-dialog__meta">
          {formatDate(pin.updatedAt)}
        </span>
        <div className="excalidraw-pin-dialog__actions">
          {isEditing ? (
            <>
              <button
                className="excalidraw-pin-dialog__btn excalidraw-pin-dialog__btn--secondary"
                onClick={handleClose}
                type="button"
              >
                {t("buttons.cancel")}
              </button>
              <button
                className="excalidraw-pin-dialog__btn excalidraw-pin-dialog__btn--primary"
                onClick={handleSave}
                type="button"
              >
                {t("buttons.save")}
              </button>
            </>
          ) : (
            <>
              <button
                className="excalidraw-pin-dialog__btn excalidraw-pin-dialog__btn--danger"
                onClick={() => onDelete(pin.id)}
                type="button"
              >
                {t("buttons.remove")}
              </button>
              <button
                className="excalidraw-pin-dialog__btn excalidraw-pin-dialog__btn--primary"
                onClick={() => onEdit(pin.id)}
                type="button"
              >
                {t("buttons.edit")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface PinsContainerProps {
  pins: PinMap;
  selectedPinId: PinId | null;
  pinDialogState: PinDialogState | null;
  onPinClick: (pinId: PinId) => void;
  onPinSave: (pinId: PinId, content: string) => void;
  onPinDelete: (pinId: PinId) => void;
  onDialogClose: (pinId: PinId, currentContent: string, isNew: boolean) => void;
  onDialogEdit: (pinId: PinId) => void;
  appState: {
    zoom: Zoom;
    offsetLeft: number;
    offsetTop: number;
    scrollX: number;
    scrollY: number;
    width: number;
    height: number;
    contextMenu: { items: any; top: number; left: number } | null;
  };
}

export const PinsContainer = ({
  pins,
  selectedPinId,
  pinDialogState,
  onPinClick,
  onPinSave,
  onPinDelete,
  onDialogClose,
  onDialogEdit,
  appState,
}: PinsContainerProps) => {
  const selectedPin = selectedPinId ? pins.get(selectedPinId) : null;

  return (
    <>
      {Array.from(pins.values()).map((pin) => (
        <PinComponent
          key={pin.id}
          pin={pin}
          isSelected={selectedPinId === pin.id}
          onClick={onPinClick}
          appState={appState}
        />
      ))}

      {selectedPin && pinDialogState && (
        <PinDialog
          pin={selectedPin}
          isEditing={pinDialogState.isEditing}
          isNew={pinDialogState.initialContent === "" && selectedPin.content === ""}
          onSave={onPinSave}
          onDelete={onPinDelete}
          onClose={onDialogClose}
          onEdit={onDialogEdit}
          appState={appState}
        />
      )}
    </>
  );
};
