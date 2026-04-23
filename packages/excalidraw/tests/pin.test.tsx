import React from "react";
import { vi } from "vitest";

import { KEYS, reseed } from "@excalidraw/common";
import { setDateTimeForTests } from "@excalidraw/common";

import * as StaticScene from "../renderer/staticScene";
import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { UI, Pointer, Keyboard } from "./helpers/ui";
import {
  render,
  fireEvent,
  mockBoundingClientRect,
  restoreOriginalGetBoundingClientRect,
  GlobalTestState,
  screen,
  queryByText,
  unmountComponent,
} from "./test-utils";

import type { ActionName } from "../actions/types";

unmountComponent();

const renderStaticScene = vi.spyOn(StaticScene, "renderStaticScene");

beforeEach(() => {
  localStorage.clear();
  renderStaticScene.mockClear();
  reseed(7);
});

const { h } = window;
const mouse = new Pointer("mouse");

describe("Pin (Comment) feature", () => {
  beforeEach(async () => {
    localStorage.clear();
    renderStaticScene.mockClear();
    reseed(7);
    setDateTimeForTests("201933152653");

    await render(<Excalidraw handleKeyboardGlobally={true} />);
  });

  beforeAll(() => {
    mockBoundingClientRect();
  });

  afterAll(() => {
    restoreOriginalGetBoundingClientRect();
  });

  afterEach(() => {
    mouse.reset();
    mouse.down(0, 0);
  });

  it("should show 'addComment' in canvas context menu", () => {
    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 100,
      clientY: 100,
    });
    const contextMenu = UI.queryContextMenu();
    expect(contextMenu).not.toBeNull();
    expect(
      contextMenu?.querySelector('li[data-testid="addComment"]'),
    ).not.toBeNull();
  });

  it("should create a pin when clicking 'Add Comment' in context menu", () => {
    fireEvent.pointerMove(GlobalTestState.interactiveCanvas, {
      clientX: 100,
      clientY: 100,
    });

    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 100,
      clientY: 100,
    });
    const contextMenu = UI.queryContextMenu();
    const addCommentItem = contextMenu?.querySelector(
      'li[data-testid="addComment"]',
    );
    expect(addCommentItem).not.toBeNull();

    fireEvent.click(addCommentItem!);

    const pinsInStorage = localStorage.getItem("excalidraw-pins");
    expect(pinsInStorage).not.toBeNull();
    const pins = JSON.parse(pinsInStorage!);
    expect(pins).toHaveLength(1);
    expect(pins[0].content).toBe("");
  });

  it("should persist pins across localStorage", () => {
    fireEvent.pointerMove(GlobalTestState.interactiveCanvas, {
      clientX: 50,
      clientY: 50,
    });

    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 50,
      clientY: 50,
    });
    let contextMenu = UI.queryContextMenu();
    let addCommentItem = contextMenu?.querySelector(
      'li[data-testid="addComment"]',
    );
    fireEvent.click(addCommentItem!);

    const pinsBefore = JSON.parse(localStorage.getItem("excalidraw-pins")!);
    expect(pinsBefore).toHaveLength(1);
    const pinId = pinsBefore[0].id;

    const updatedPins = [
      {
        ...pinsBefore[0],
        content: "Test comment content",
      },
    ];
    localStorage.setItem("excalidraw-pins", JSON.stringify(updatedPins));

    const pinsAfter = JSON.parse(localStorage.getItem("excalidraw-pins")!);
    expect(pinsAfter).toHaveLength(1);
    expect(pinsAfter[0].id).toBe(pinId);
    expect(pinsAfter[0].content).toBe("Test comment content");
  });

  it("should delete a pin when removed from storage", () => {
    fireEvent.pointerMove(GlobalTestState.interactiveCanvas, {
      clientX: 50,
      clientY: 50,
    });

    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 50,
      clientY: 50,
    });
    let contextMenu = UI.queryContextMenu();
    let addCommentItem = contextMenu?.querySelector(
      'li[data-testid="addComment"]',
    );
    fireEvent.click(addCommentItem!);

    const pinsBefore = JSON.parse(localStorage.getItem("excalidraw-pins")!);
    expect(pinsBefore).toHaveLength(1);

    localStorage.setItem("excalidraw-pins", JSON.stringify([]));

    const pinsAfter = JSON.parse(localStorage.getItem("excalidraw-pins")!);
    expect(pinsAfter).toHaveLength(0);
  });

  it("should create multiple pins", () => {
    fireEvent.pointerMove(GlobalTestState.interactiveCanvas, {
      clientX: 50,
      clientY: 50,
    });

    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 50,
      clientY: 50,
    });
    let contextMenu = UI.queryContextMenu();
    let addCommentItem = contextMenu?.querySelector(
      'li[data-testid="addComment"]',
    );
    fireEvent.click(addCommentItem!);

    fireEvent.pointerMove(GlobalTestState.interactiveCanvas, {
      clientX: 150,
      clientY: 150,
    });

    fireEvent.contextMenu(GlobalTestState.interactiveCanvas, {
      button: 2,
      clientX: 150,
      clientY: 150,
    });
    contextMenu = UI.queryContextMenu();
    addCommentItem = contextMenu?.querySelector('li[data-testid="addComment"]');
    fireEvent.click(addCommentItem!);

    const pins = JSON.parse(localStorage.getItem("excalidraw-pins")!);
    expect(pins).toHaveLength(2);
  });
});
