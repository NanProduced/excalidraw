import { CaptureUpdateAction } from "@excalidraw/element";

import { register } from "./register";

export const actionAddComment = register({
  name: "addComment",
  label: "labels.addComment",
  viewMode: true,
  trackEvent: {
    category: "canvas",
    action: "addComment",
  },
  perform(elements, appState, _formData, app) {
    const contextMenuCoords = (app as any).lastContextMenuSceneCoords;
    const coords = contextMenuCoords || app.lastPointerMoveCoords;

    if (coords) {
      app.addCommentAtPosition(coords.x, coords.y);
    }

    return {
      appState: {
        ...appState,
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
});
