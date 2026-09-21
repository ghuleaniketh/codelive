import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { TestRunnerState } from "@/pages/TestRunnerStatePage";
import { Route, Switch } from "wouter";
import { AssetLoader } from "./components/AssetLoader";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import TestAuthPage from "./pages/TestAuthPage";
import { TestScenesPage } from "./features/story-viewer/scenes/TestScenesPage";
import { StoryDemoPage } from "./pages/StoryDemoPage";
import { QuestionInputPage } from "./features/question-input/QuestionInputPage";
import { sceneTokens } from "./features/story-viewer/scenes/sceneTokens";

import { BackgroundVideo } from "./features/story-viewer/BackgroundVideo";

function Router() {
  return (
    <Switch>
      <Route path={"/404"} component={NotFound} />
      <Route path={"/test-runner-state"} component={TestRunnerState} />
      <Route path={"/test-auth"} component={TestAuthPage} />
      <Route path={"/test-scenes"} component={TestScenesPage} />
      <Route path={"/story-demo"} component={StoryDemoPage} />
      <Route path={"/"} component={QuestionInputPage} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AssetLoader>
        <ThemeProvider
          defaultTheme="dark"
          switchable
        >
        <TooltipProvider>
          <Toaster />
          <div
            style={{
              position: "relative",
              minHeight: "100vh",
              width: "100%",
              backgroundColor: "#0B0D10",
              color: "#EDEEF0",
              overflow: "hidden",
            }}
          >
            {/* Shared full-bleed ambient video background layer with brighter, clearer 35% scrim */}
            <BackgroundVideo src="/background.mp4" overlayOpacity={0.35} />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                minHeight: "100vh",
                width: "100%",
              }}
            >
              <Router />
            </div>
          </div>
        </TooltipProvider>
        </ThemeProvider>
      </AssetLoader>
    </ErrorBoundary>
  );
}

export default App;
