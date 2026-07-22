import { registerRoot } from "remotion";

import { RemotionRoot } from "./Root";

// Remotion bundle entry point. `@remotion/bundler` compiles this file (and the
// compositions it registers) with its own webpack, so it is safe that the rest
// of the worker runs under tsx.
registerRoot(RemotionRoot);
