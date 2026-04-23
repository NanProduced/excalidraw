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
    if (app.lastPointerMoveCoords) {
      app.addCommentAtPosition(
        app.lastPointerMoveCoords.x,
        app.lastPointerMoveCoords.y,
      );
    }

    return {
      appState: {
        ...appState,
      },
      captureUpdate: CaptureUpdateAction.EVENTUALLY,
    };
  },
});
