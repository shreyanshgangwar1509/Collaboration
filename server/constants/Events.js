export const ACTIONS = {
  // General & Room Management
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  LEAVE: "leave",
  NOTIFICATION: "notification",
  USERS_IN_ROOM: "users in room",
  USER_LEFT: "user left",
  AUTH_ERROR: "auth_error",

  // Chat
  SEND_MESSAGE: "send message",
  MESSAGE_RECEIVED: "message received",
  USER_TYPING: "user typing",
  USER_STOP_TYPING: "user stop typing",

  // Code Editor
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  EDITOR_CHANGE: "editor_change",
  JOIN_EDITOR: "join_editor_room",
  LEAVE_EDITOR: "leave_editor_room",

  // Whiteboard
  JOIN_WHITEBOARD: "join_whiteboard_room",
  LEAVE_WHITEBOARD: "leave_whiteboard_room",
  CANVAS_DATA: "canvas-data",
  WHITEBOARD_CLEAR: "whiteboard-clear",

  // Docs
  JOIN_DOC: "join_doc_room",
  LEAVE_DOC: "leave_doc_room",
  DOC_CHANGE: "doc_change",
  DOC_CURSOR: "doc_cursor",

  // PPT
  JOIN_PPT: "join_ppt_room",
  LEAVE_PPT: "leave_ppt_room",
  PPT_SLIDE_ADD: "ppt_slide_add",
  PPT_SLIDE_UPDATE: "ppt_slide_update",
  PPT_SLIDE_DELETE: "ppt_slide_delete",
  PPT_SLIDE_REORDER: "ppt_slide_reorder",
  PPT_CURRENT_SLIDE: "ppt_current_slide",

  // Photo
  JOIN_PHOTO: "join_photo_room",
  LEAVE_PHOTO: "leave_photo_room",
  PHOTO_OBJECT_ADD: "photo_object_add",
  PHOTO_OBJECT_MODIFY: "photo_object_modify",
  PHOTO_OBJECT_DELETE: "photo_object_delete",
  PHOTO_CANVAS_STATE: "photo_canvas_state",
};