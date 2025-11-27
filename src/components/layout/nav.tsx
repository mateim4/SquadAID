import { NavLink } from "react-router-dom";
import { Users, Workflow, LayoutDashboard } from "lucide-react";

export function Nav() {
  return (
    <nav className="grid items-start gap-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
            isActive ? "bg-muted text-primary" : ""
          }`
        }
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </NavLink>
      <NavLink
        to="/agents"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
            isActive ? "bg-muted text-primary" : ""
          }`
        }
      >
        <Users className="h-4 w-4" />
        Agents
      </NavLink>
      <NavLink
        to="/workflows"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
            isActive ? "bg-muted text-primary" : ""
          }`
        }
      >
        <Workflow className="h-4 w-4" />
        Workflows
      </NavLink>
    </nav>
  );
}
