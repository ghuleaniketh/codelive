import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { TestRunnerState } from "@/pages/TestRunnerStatePage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import TestAuthPage from "./pages/TestAuthPage";
import { TestScenesPage } from "./features/story-viewer/scenes/TestScenesPage";
import { QuestionInputPage } from "./features/question-input/QuestionInputPage";
import { sceneTokens } from "./features/story-viewer/scenes/sceneTokens";

function Router() {
  return (
    <Switch>
      <Route path={"/404"} component={NotFound} />
      <Route path={"/test-runner-state"} component={TestRunnerState} />
      <Route path={"/test-auth"} component={TestAuthPage} />
      <Route path={"/test-scenes"} component={TestScenesPage} />
      <Route path={"/"} component={QuestionInputPage} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <div
            style={{
              minHeight: "100vh",
              backgroundColor: sceneTokens.surfaces.canvas,
              color: sceneTokens.text.primary,
            }}
          >
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
