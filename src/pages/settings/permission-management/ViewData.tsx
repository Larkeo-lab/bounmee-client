import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Checkbox,
} from "@heroui/react";
import Breadcrum, { BreadcrumbItemType } from "@/components/common/breadcrum";
import { PenLine, XCircle } from "lucide-react";

type PermissionRow = {
  id: string;
  name: string;
  permissions: {
    license: boolean;
    add: boolean;
    view: boolean;
    edit: boolean;
    all: boolean;
  };
};

export default function ViewData() {
  const location = useLocation();
  const navState = (location.state || {}) as any;
  // initialize edit mode from navigation state so checkboxes are immediately enabled
  const [isEditing, setIsEditing] = useState<boolean>(Boolean(navState?.edit));

  useEffect(() => {
    // also react to changes in navigation state (defensive)
    if (navState?.edit) setIsEditing(true);
  }, [navState?.edit]);

  const [rows, setRows] = useState<PermissionRow[]>([
    {
      id: "dashboard",
      name: "ໜ້າພາບລວມ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "ministry",
      name: "ຈັດການກະຊວງ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "province",
      name: "ຈັດການແຂວງ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "district",
      name: "ຈັດການຟອມ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "village",
      name: "ຈັດການສູນບໍລິການ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "temple",
      name: "ຈັດການການບໍລິການ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "monk",
      name: "ຈັດການໝວດໝູ່",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "user",
      name: "ຈັດການການຈອງ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "admin",
      name: "ຈັດການການຈອງ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
    {
      id: "life",
      name: "ຈັດການການແຈ້ງເຕືອນ",
      permissions: {
        license: false,
        add: true,
        view: true,
        edit: false,
        all: false,
      },
    },
  ]);

  const togglePermission = (
    rowId: string,
    key: keyof PermissionRow["permissions"]
  ) => {
    if (!isEditing) return; // disable toggle in view mode
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              permissions: { ...r.permissions, [key]: !r.permissions[key] },
            }
          : r
      )
    );
  };

  const breadcrumbItems: BreadcrumbItemType[] = [
    { label: "ຕັ້ງຄ່າກຳນົດສິດແອັດມິນ", href: "/settingPermission" },
    { label: "ລາຍລະອຽດ" },
  ];

  return (
    <>
      <Breadcrum items={breadcrumbItems} />

      <Card className="mt-3 shadow-sm">
        <CardHeader className="flex flex-col gap-3 px-6 pt-6 pb-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-800">
                ລາຍລະອຽດສິດໃນການເຂົ້າເຖິງ
              </h2>
              <p className="text-sm text-default-500">
                Role: <span className="text-blue-600 font-bold">Admin</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="flat"
                className="border border-gray-300 text-gray-700 flex items-center gap-2"
                onClick={() => setIsEditing(false)}
                isDisabled={!isEditing}
              >
                <XCircle size={16} />
                ປິດການແກ້ໄຂ
              </Button>

              <Button
                color={isEditing ? "default" : "primary"}
                className="flex items-center gap-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                <PenLine size={16} />
                {isEditing ? "ບັນທຶກ" : "ແກ້ໄຂ"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-6 py-4">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <Table
              aria-label="Permission Table"
              removeWrapper
              classNames={{
                base: "max-h-[520px]",
                table: "min-h-[420px]",
              }}
            >
              <TableHeader>
                <TableColumn
                  key="name"
                  className="bg-gray-50 text-xs uppercase font-medium text-gray-600"
                >
                  Function
                </TableColumn>
                <TableColumn
                  key="license"
                  className="bg-gray-50 text-xs uppercase font-medium text-gray-600 text-center"
                >
                  ອອກໃບອະນຸຍາດ
                </TableColumn>
                <TableColumn
                  key="add"
                  className="bg-gray-50 text-xs uppercase font-medium text-gray-600 text-center"
                >
                  ເພີ່ມຂໍ້ມູນ
                </TableColumn>
                <TableColumn
                  key="view"
                  className="bg-gray-50 text-xs uppercase font-medium text-gray-600 text-center"
                >
                  ເບິ່ງຂໍ້ມູນ
                </TableColumn>
                <TableColumn
                  key="edit"
                  className="bg-gray-50 text-xs uppercase font-medium text-gray-600 text-center"
                >
                  ແກ້ໄຂຂໍ້ມູນ
                </TableColumn>
                <TableColumn
                  key="all"
                  className="bg-gray-50 text-xs uppercase font-medium text-gray-600 text-center"
                >
                  ໃຊ້ສິດເຕັມ
                </TableColumn>
              </TableHeader>

              <TableBody items={rows}>
                {(item: PermissionRow) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    {(columnKey: React.Key) => {
                      if (columnKey === "name") {
                        return (
                          <TableCell className="font-medium text-gray-900">
                            {item.name}
                          </TableCell>
                        );
                      }
                      const key =
                        columnKey as keyof PermissionRow["permissions"];
                      return (
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              isSelected={item.permissions[key]}
                              onValueChange={() =>
                                togglePermission(item.id, key)
                              }
                              isDisabled={!isEditing}
                              size="md"
                            />
                          </div>
                        </TableCell>
                      );
                    }}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>

        <CardFooter className="flex flex-col items-start gap-3 px-6 pb-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800">ຂໍ້ມູນການອັບເດດ</h3>
          <p className="text-sm text-gray-600">
            ລາຍລະອຽດສິດນີ້ຖືກສ້າງແລະປັບປຸງໂດຍຜູ້ຄວບຄຸມລະບົບ
          </p>
          <div className="space-y-2 text-sm text-gray-600 w-full">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 min-w-[140px]">
                ສ້າງໂດຍ:
              </span>
              <span className="text-gray-700">Superadmin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 min-w-[140px]">
                ວັນທີອັບເດດລ່າສຸດ:
              </span>
              <span className="text-gray-700">21/08/2024</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800 min-w-[140px]">
                ອັບເດດໂດຍ:
              </span>
              <span className="text-gray-700">Superadmin</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
