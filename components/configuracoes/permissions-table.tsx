import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userRoles } from "@/lib/mock-usuarios";
import { accessLevelMeta, permissionModules, permissionsMatrix } from "@/lib/permissions";

export function PermissionsTable() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Módulo</TableHead>
            {userRoles.map((role) => (
              <TableHead key={role.value}>{role.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissionModules.map((module) => (
            <TableRow key={module.value}>
              <TableCell className="font-medium">{module.label}</TableCell>
              {userRoles.map((role) => {
                const level = permissionsMatrix[role.value][module.value];
                const meta = accessLevelMeta[level];
                return (
                  <TableCell key={role.value}>
                    <span className={`flex items-center gap-1.5 ${meta.className}`}>
                      <meta.icon className="size-3.5" />
                      {meta.label}
                    </span>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
