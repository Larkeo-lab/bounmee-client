import type { Key } from "react";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Card,
  CardBody,
  CardFooter,
  Checkbox,
  Textarea,
  Input,
} from "@heroui/react";
import { Save, CornerDownRight, Shield } from "lucide-react";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import Breadcrum, { BreadcrumbItemType } from "@/components/common/breadcrum";
import {
  useCreatePermission,
  useUpdatePermission,
} from "@/services/role-permission";
import { useAuth } from "@/routes/AuthContext";

type PermissionType = "read" | "create" | "update" | "delete" | "full_access";

type PermissionId =
  | "pos"
  | "cafe"
  | "order"
  | "debt"
  | "ordering"
  | "kitchen"
  | "table"
  | "table_settings"
  | "settings"
  | "product"
  | "category"
  | "bank"
  | "employee"
  | "printer"
  | "money_rate"
  | "role_permission"
  | "profile"
  | "dashboard"
  | "chat";

type PermissionRow = {
  id: PermissionId;
  name: string;
  permissions: {
    read: boolean;
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    full_access?: boolean;
  };
};

// Zod validation schema
const roleSchema = (t: any) =>
  z.object({
    roleName: z.string().min(1, t("permission.roleNameRequired")),
  });

export default function AddRoleUser() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [roleName, setRoleName] = useState(location?.state?.name || "");
  const [description, setDescription] = useState(
    location?.state?.description || "",
  );
  const [errors, setErrors] = useState<{ roleName?: string }>({});

  const allPermissions: PermissionRow[] = [
    {
      id: "table",
      name: "sidebar.menu.table",
      permissions: { read: false },
    },
    {
      id: "pos",
      name: "sidebar.menu.pos",
      permissions: { read: false },
    },
    {
      id: "cafe",
      name: "sidebar.menu.cafe",
      permissions: { read: false },
    },
    {
      id: "dashboard",
      name: "sidebar.menu.statisticsReport",
      permissions: { read: false },
    },
    {
      id: "order",
      name: "sidebar.menu.order",
      permissions: { read: false },
    },
    {
      id: "debt",
      name: "sidebar.menu.debt",
      permissions: { read: false },
    },
    {
      id: "ordering",
      name: "sidebar.menu.ordering",
      permissions: { read: false },
    },
    {
      id: "kitchen",
      name: "sidebar.menu.kitchen",
      permissions: { read: false },
    },
    {
      id: "chat",
      name: "sidebar.menu.chat",
      permissions: { read: false },
    },
    {
      id: "settings",
      name: "sidebar.menu.setting",
      permissions: { read: false },
    },
    {
      id: "product",
      name: "sidebar.menu.manageProduct",
      permissions: { read: false },
    },
    {
      id: "category",
      name: "sidebar.menu.manageCategory",
      permissions: { read: false },
    },
    {
      id: "bank",
      name: "sidebar.menu.manageBank",
      permissions: { read: false },
    },
    {
      id: "employee",
      name: "sidebar.menu.manageEmployee",
      permissions: { read: false },
    },
    {
      id: "printer",
      name: "sidebar.menu.managePrinter",
      permissions: { read: false },
    },
    {
      id: "profile",
      name: "sidebar.menu.manageProfile",
      permissions: { read: false },
    },
    {
      id: "money_rate",
      name: "sidebar.menu.manageMoneyRate",
      permissions: { read: false },
    },
    {
      id: "role_permission",
      name: "sidebar.menu.managePermission",
      permissions: { read: false },
    },
    {
      id: "table_settings",
      name: "sidebar.menu.manageTable",
      permissions: { read: false },
    },
  ];

  const { user } = useAuth();
  const storeType = user?.user?.store?.type;

  const filteredPermissions = useMemo(() => {
    if (storeType === "GENERAL_STORE") {
      return allPermissions.filter(
        (p) =>
          ![
            "table",
            "cafe",
            "ordering",
            "kitchen",
            "chat",
            "table_settings",
          ].includes(p.id),
      );
    }
    if (storeType === "CAFE") {
      return allPermissions.filter(
        (p) =>
          ![
            "table",
            "pos",
            "ordering",
            "kitchen",
            "chat",
            "table_settings",
          ].includes(p.id),
      );
    }
    if (storeType === "RESTAURANT") {
      return allPermissions.filter((p) => !["pos"].includes(p.id));
    }

    return allPermissions;
  }, [storeType]);

  const [permissions, setPermissions] =
    useState<PermissionRow[]>(filteredPermissions);

  // Sync state if filteredPermissions changes (e.g. after user loads)
  useEffect(() => {
    setPermissions(filteredPermissions);
  }, [filteredPermissions]);

  const storeId = user?.user?.store?.id || "";
  const queryClient = useQueryClient();

  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();

  // Determine if we're in edit mode
  const isEditMode = useMemo(
    () => !!location?.state?.id,
    [location?.state?.id],
  );

  // Populate permissions from location.state when in edit mode
  useEffect(() => {
    if (isEditMode && location?.state?.permissions) {
      const statePermissions = location.state.permissions;

      setPermissions((prev) =>
        prev.map((row) => {
          const rowPermissions = statePermissions[row.id] || [];
          const read = rowPermissions.includes("read");
          const create = rowPermissions.includes("create");
          const update = rowPermissions.includes("update");
          const deletePermission = rowPermissions.includes("delete");
          const full_access = read && create && update && deletePermission;

          return {
            ...row,
            permissions: {
              read,
              create,
              update,
              delete: deletePermission,
              full_access,
            },
          };
        }),
      );
    }
  }, [isEditMode, location?.state?.permissions]);

  const togglePermission = (
    rowId: PermissionRow["id"],
    key: PermissionType,
  ) => {
    setPermissions((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          // If toggling full_access, set all permissions to the same value
          if (key === "full_access") {
            const newValue = !r.permissions[key];

            return {
              ...r,
              permissions: {
                read: newValue,
                create: newValue,
                update: newValue,
                delete: newValue,
                full_access: newValue,
              },
            };
          }
          // If toggling other permissions, just toggle that permission
          const newPermissions = {
            ...r.permissions,
            [key]: !r.permissions[key],
          };
          // If all other permissions are checked, auto-check full_access
          const allOthersChecked =
            newPermissions.read &&
            newPermissions.create &&
            newPermissions.update &&
            newPermissions.delete;

          if (allOthersChecked) {
            newPermissions.full_access = true;
          } else {
            newPermissions.full_access = false;
          }

          return {
            ...r,
            permissions: newPermissions,
          };
        }

        return r;
      }),
    );
  };

  const toggleAllPermissions = () => {
    const allChecked = permissions.every((row) =>
      Object.values(row.permissions).every((val) => val === true),
    );

    setPermissions((prev) =>
      prev.map((row) => ({
        ...row,
        permissions: {
          read: !allChecked,
          create: !allChecked,
          update: !allChecked,
          delete: !allChecked,
          full_access: !allChecked,
        },
      })),
    );
  };

  const isAllPermissionsChecked = () => {
    return permissions.every((row) =>
      Object.values(row.permissions).every((val) => val === true),
    );
  };

  const handleSave = () => {
    // Clear previous errors
    setErrors({});

    // Validate using Zod
    const validation: any = roleSchema(t).safeParse({ roleName });

    if (!validation.success) {
      const fieldErrors: { roleName?: string } = {};

      // Use issues instead of errors and add safety check
      validation.error?.issues?.forEach((err: any) => {
        if (err.path[0] === "roleName") {
          fieldErrors.roleName = err.message;
        }
      });
      setErrors(fieldErrors);

      return;
    }

    // Build permissions object
    const _permissions: Record<string, string[]> = {};

    if (permissions && Array.isArray(permissions)) {
      permissions.forEach((row: PermissionRow) => {
        if (!row || !row.permissions) return;
        const activePermissions: string[] = [];

        (Object.keys(row.permissions) as PermissionType[]).forEach((key) => {
          // Skip full_access as it's only a UI helper, not sent to API
          if (row.permissions[key] && key !== "full_access") {
            activePermissions.push(key);
          }
        });
        // Only add to permissions if there are active permissions (not empty)
        if (activePermissions.length > 0) {
          _permissions[row.id] = activePermissions;
        }
      });
    }

    // Prepare request body
    const requestBody = {
      name: roleName,
      description: description,
      permissions: _permissions,
      storeId: storeId,
    };

    console.log("requestBody", requestBody);

    if (isEditMode && location?.state?.id) {
      updatePermissionMutation.mutate(
        {
          id: location.state.id,
          data: requestBody,
        },
        {
          onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["permissions"] });
            navigate("/permission-manage");
          },
        },
      );
    } else {
      createPermissionMutation.mutate(requestBody, {
        onSuccess: () => {
          queryClient.removeQueries({ queryKey: ["permissions"] });
          navigate("/permission-manage");
        },
      });
    }
  };

  const handleClear = () => {
    setRoleName("");
    setDescription("");
    setPermissions((r) =>
      r.map((row) => ({
        ...row,
        permissions: {
          read: false,
          create: false,
          update: false,
          delete: false,
          full_access: false,
        },
      })),
    );
  };

  const breadcrumbItems: BreadcrumbItemType[] = [
    { label: t("permission.title"), href: "/permission-manage" },
    {
      label: isEditMode ? t("permission.editTitle") : t("permission.addTitle"),
    },
  ];

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Shield size={28} />
            {isEditMode ? t("permission.editTitle") : t("permission.addTitle")}
          </h1>
          <p className="text-default-500">{t("permission.subtitle")}</p>
        </div>
      </div>

      <Breadcrum items={breadcrumbItems} />

      <Card className="py-4" shadow="sm">
        <CardBody className="px-6 space-y-4">
          {/* Role Info */}
          <div className="w-1/3">
            <Input
              isRequired
              color={errors.roleName ? "danger" : "default"}
              errorMessage={errors.roleName}
              isInvalid={!!errors.roleName}
              label={t("permission.permissionName")}
              labelPlacement="outside"
              placeholder={t("permission.enterRoleName")}
              size="lg"
              value={roleName}
              variant="bordered"
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              label={t("permission.descriptionLabel")}
              labelPlacement="outside"
              minRows={3}
              placeholder={t("permission.enterDescription")}
              value={description}
              variant="bordered"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Table */}
          <Table
            aria-label="Permissions table"
            classNames={{
              wrapper:
                "shadow-sm border border-divider rounded-xl overflow-hidden p-0",
              th: "bg-default-50 text-default-600 font-bold h-12",
              td: "text-sm",
            }}
            shadow="sm"
          >
            <TableHeader>
              <TableColumn key="name">
                <div className="flex items-center gap-2">
                  <Checkbox
                    isSelected={isAllPermissionsChecked()}
                    onValueChange={toggleAllPermissions}
                  />
                  <span>{t("permission.fullAccess")}</span>
                </div>
              </TableColumn>
              <TableColumn key="read">{t("permission.show")}</TableColumn>
              {/* <TableColumn key="create">ສ້າງຂໍ້ມູນ</TableColumn>
              <TableColumn key="update">ແກ້ໄຂຂໍ້ມູນ</TableColumn>
              <TableColumn key="delete">ລົບຂໍ້ມູນ</TableColumn> */}
              {/* <TableColumn key="full_access">ຈັດການທັງໝົດ</TableColumn> */}
            </TableHeader>

            <TableBody items={permissions}>
              {(item: PermissionRow) => (
                <TableRow key={item.id}>
                  {(columnKey: Key) => {
                    const key = String(columnKey);

                    switch (key) {
                      case "name":
                        const isSubItem = [
                          "product",
                          "category",
                          "bank",
                          "employee",
                          "printer",
                          "money_rate",
                          "role_permission",
                          "profile",
                          "table_settings",
                        ].includes(item.id);

                        return (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isSubItem && (
                                <CornerDownRight
                                  className="text-gray-400 ml-6"
                                  size={16}
                                />
                              )}
                              <span>
                                {item.name.includes(".")
                                  ? t(item.name)
                                  : item.name}
                              </span>
                            </div>
                          </TableCell>
                        );
                      case "read":
                      case "create":
                      case "update":
                      case "delete":
                      case "full_access":
                        const isHeader = ["settings"].includes(item.id);

                        if (isHeader) return <TableCell>{null}</TableCell>;
                        if (key !== "read")
                          return <TableCell>{null}</TableCell>;

                        return (
                          <TableCell>
                            <Checkbox
                              isSelected={
                                item.permissions[key as PermissionType]
                              }
                              size="md"
                              onValueChange={() =>
                                togglePermission(item.id, key as PermissionType)
                              }
                            />
                          </TableCell>
                        );
                      default:
                        return <TableCell>{null}</TableCell>;
                    }
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>

        <CardFooter className="flex justify-end gap-4 px-6">
          <Button
            className="flex items-center gap-2"
            isDisabled={
              createPermissionMutation.isPending ||
              updatePermissionMutation.isPending
            }
            variant="bordered"
            onPress={handleClear}
          >
            <span>{t("settings.common.cancel")}</span>
          </Button>
          <Button
            className="flex items-center gap-2 px-6"
            color="primary"
            isLoading={
              createPermissionMutation.isPending ||
              updatePermissionMutation.isPending
            }
            onPress={handleSave}
          >
            <Save size={16} />
            <span>{t("settings.common.save")}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
