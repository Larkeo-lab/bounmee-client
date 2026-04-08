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
import type { Key } from "react";
import { Save, CornerDownRight } from "lucide-react";
import Breadcrum, { BreadcrumbItemType } from "@/components/common/breadcrum";
import { z } from "zod";
import {
  useCreatePermission,
  useUpdatePermission,
} from "@/services/role-permission";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/routes/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

type PermissionType = "read" | "create" | "update" | "delete" | "full_access";

type PermissionId =
  | "pos"
  | "cafe"
  | "order"
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
const roleSchema = z.object({
  roleName: z.string().min(1, "ກະລຸນາປ້ອນຊື່ສິດການເຂົ້າເຖິງ"),
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

  const [permissions, setPermissions] = useState<PermissionRow[]>([
    {
      id: "table",
      name: "sidebar.menu.table",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "pos",
      name: "sidebar.menu.pos",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "cafe",
      name: "sidebar.menu.cafe",
      permissions: {
        read: false,
      },
    },
    {
      id: "dashboard",
      name: "sidebar.menu.statisticsReport",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "order",
      name: "sidebar.menu.order",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "ordering",
      name: "sidebar.menu.ordering",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "kitchen",
      name: "sidebar.menu.kitchen",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "chat",
      name: "sidebar.menu.chat",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },

    {
      id: "settings",
      name: "sidebar.menu.setting",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "product",
      name: "sidebar.menu.manageProduct",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "category",
      name: "sidebar.menu.manageCategory",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "bank",
      name: "sidebar.menu.manageBank",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "employee",
      name: "sidebar.menu.manageEmployee",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "printer",
      name: "sidebar.menu.managePrinter",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "profile",
      name: "sidebar.menu.manageProfile",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "money_rate",
      name: "sidebar.menu.manageMoneyRate",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "role_permission",
      name: "sidebar.menu.managePermission",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
    {
      id: "table_settings",
      name: "sidebar.menu.manageTable",
      permissions: {
        read: false,
        // create: false,
        // update: false,
        // delete: false,
        // full_access: false,
      },
    },
  ]);

  const { user } = useAuth();
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
    const validation: any = roleSchema.safeParse({ roleName });

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
    { label: "ຕັ້ງຄ່າກຳນົດສິດ", href: "/permission-manage" },
    { label: isEditMode ? "ແກ້ໄຂສິດ" : "ເພີ່ມສິດ" },
  ];

  return (
    <>
      <Breadcrum items={breadcrumbItems} />

      <Card shadow="sm" className="py-4">
        <CardBody className="px-6 space-y-4">
          {/* Role Info */}
          <div className="w-1/3">
            <Input
              placeholder="ປ້ອນຊື່ສິດນຳໃຊ້..."
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              label="ຊື່ສິດນຳໃຊ້"
              labelPlacement="outside"
              variant="bordered"
              isRequired
              size="lg"
              isInvalid={!!errors.roleName}
              errorMessage={errors.roleName}
              color={errors.roleName ? "danger" : "default"}
            />
          </div>
          <div>
            <Textarea
              placeholder="ປ້ອນຄຳອະທິບາຍສິດການເຂົ້າເຖິງ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={3}
              labelPlacement="outside"
              variant="bordered"
              label="ຄຳອະທິບາຍ (ຖ້າມີ)"
            />
          </div>

          {/* Table */}
          <Table
            aria-label="Permissions table"
            classNames={{
              base: "max-h-[520px]",
              table: "min-h-[280px]",
              // wrapper: "shadow-none",
              th: "text-sm",
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
                  <span>ເຂົ້າເຖິງທັງໝົດໃນລະບົບ</span>
                </div>
              </TableColumn>
              <TableColumn key="read">ສະແດງ</TableColumn>
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
                                  size={16}
                                  className="text-gray-400 ml-6"
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
                              onValueChange={() =>
                                togglePermission(item.id, key as PermissionType)
                              }
                              size="md"
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
            variant="bordered"
            className="flex items-center gap-2"
            onPress={handleClear}
            isDisabled={
              createPermissionMutation.isPending ||
              updatePermissionMutation.isPending
            }
          >
            <span>ຍົກເລີກ</span>
          </Button>
          <Button
            color="primary"
            className="flex items-center gap-2 px-6"
            onPress={handleSave}
            isLoading={
              createPermissionMutation.isPending ||
              updatePermissionMutation.isPending
            }
          >
            <Save size={16} />
            <span>ບັນທຶກຂໍ້ມູນ</span>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
