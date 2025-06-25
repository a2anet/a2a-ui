export interface AgentCapabilities {
  extensions?: AgentExtension[];
  pushNotifications?: boolean;
  stateTransitionHistory?: boolean;
  streaming?: boolean;
}

export interface AgentExtension {
  description?: string;
  params?: { [key: string]: unknown };
  required?: boolean;
  uri: string;
}

export interface AgentProvider {
  organization: string;
  url: string;
}

export interface AgentSkill {
  description: string;
  examples?: string[];
  id: string;
  inputModes?: string[];
  name: string;
  outputModes?: string[];
  tags: string[];
}

export interface SecurityScheme {
  description?: string;
  type: string;
  [key: string]: any; // Allow for additional security scheme properties
}

export interface AgentCard {
  capabilities: AgentCapabilities;
  defaultInputModes: string[];
  defaultOutputModes: string[];
  description: string;
  documentationUrl?: string;
  iconUrl?: string;
  name: string;
  provider?: AgentProvider;
  security?: { [key: string]: string[] }[];
  securitySchemes?: { [key: string]: SecurityScheme };
  skills: AgentSkill[];
  supportsAuthenticatedExtendedCard?: boolean;
  url: string;
  version: string;
}

// Additional types for chat functionality
export type Part = TextPart | FilePart | DataPart;

export interface TextPart {
  kind: "text";
  metadata?: { [key: string]: unknown };
  text: string;
}

export interface FilePart {
  file: FileWithBytes | FileWithUri;
  kind: "file";
  metadata?: { [key: string]: unknown };
}

export interface FileWithBytes {
  bytes: string;
  mimeType?: string;
  name?: string;
}

export interface FileWithUri {
  mimeType?: string;
  name?: string;
  uri: string;
}

export interface DataPart {
  data: { [key: string]: unknown };
  kind: "data";
  metadata?: { [key: string]: unknown };
}

export interface Message {
  contextId?: string;
  extensions?: string[];
  kind: "message";
  messageId: string;
  metadata?: { [key: string]: unknown };
  parts: Part[];
  referenceTaskIds?: string[];
  role: "agent" | "user";
  taskId?: string;
}

export interface Artifact {
  artifactId: string;
  description?: string;
  extensions?: string[];
  metadata?: { [key: string]: unknown };
  name?: string;
  parts: Part[];
}

export type TaskState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "canceled"
  | "failed"
  | "rejected"
  | "auth-required"
  | "unknown";

export interface TaskStatus {
  message?: Message;
  state: TaskState;
  timestamp?: string;
}

export interface Task {
  artifacts?: Artifact[];
  contextId: string;
  history?: Message[];
  id: string;
  kind: "task";
  metadata?: { [key: string]: unknown };
  status: TaskStatus;
}

// Message sending related types
export interface MessageSendParams {
  message: Message;
  configuration?: MessageSendConfiguration;
  metadata?: { [key: string]: unknown };
}

export interface MessageSendConfiguration {
  acceptedOutputModes: string[];
  blocking?: boolean;
  historyLength?: number;
  pushNotificationConfig?: PushNotificationConfig;
}

export interface PushNotificationConfig {
  authentication?: PushNotificationAuthenticationInfo;
  id?: string;
  token?: string;
  url: string;
}

export interface PushNotificationAuthenticationInfo {
  credentials?: string;
  schemes: string[];
}

export interface SendMessageResponse {
  id: string | number | null;
  jsonrpc: "2.0";
  result?: Task | Message;
  error?: any;
}

export interface SendMessageSuccessResponse {
  id: string | number | null;
  jsonrpc: "2.0";
  result: Task | Message;
}
