import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.component").then((c) => c.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./pages/register/register.component").then(
        (c) => c.RegisterComponent,
      ),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./layout/layout.component").then((c) => c.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: "",
        redirectTo: "candidates",
        pathMatch: "full",
      },
      {
        path: "candidates",
        loadComponent: () =>
          import("./pages/candidates/candidates.component").then(
            (c) => c.CandidatesComponent,
          ),
      },
      {
        path: "candidates/add",
        loadComponent: () =>
          import("./pages/candidate-form/candidate-form.component").then(
            (c) => c.CandidateFormComponent,
          ),
      },
      {
        path: "candidates/edit/:id",
        loadComponent: () =>
          import("./pages/candidate-form/candidate-form.component").then(
            (c) => c.CandidateFormComponent,
          ),
      },
      {
        path: "job-offers",
        loadComponent: () =>
          import("./pages/job-offers/job-offers.component").then(
            (c) => c.JobOffersComponent,
          ),
      },
      {
        path: "pipeline",
        loadComponent: () =>
          import("./pages/recruitment-pipeline/recruitment-pipeline.component").then(
            (c) => c.RecruitmentPipelineComponent,
          ),
      },
      {
        path: "ai",
        loadComponent: () =>
          import("./pages/ai-panel/ai-panel.component").then(
            (c) => c.AiPanelComponent,
          ),
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./pages/settings/settings.component").then(
            (c) => c.SettingsComponent,
          ),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "login",
  },
];
