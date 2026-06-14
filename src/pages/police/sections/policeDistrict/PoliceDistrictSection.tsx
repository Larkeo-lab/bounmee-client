import React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  ArrowLeft,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

import {
  useGetPoliceDistricts,
  useCreatePoliceDistrict,
  useUpdatePoliceDistrict,
  useDeletePoliceDistrict,
  PoliceDistrictItem,
} from "@/services/police-district/usePoliceDistrict";
import { useGetAllProvinces } from "@/services/province/useProvince";
import { useGetDistrictsByProvince } from "@/services/district/useDistrict";
import { useGetVillagesByDistrict } from "@/services/village/useVillage";
import { useAuth } from "@/routes/AuthContext";

type Mode = "list" | "create" | "edit";

const inputClass =
  "border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition";

export default function PoliceDistrictSection() {
  const queryClient = useQueryClient();
  const [mode, setMode] = React.useState<Mode>("list");
  const [editing, setEditing] = React.useState<PoliceDistrictItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<PoliceDistrictItem | null>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: districts = [], isLoading } = useGetPoliceDistricts();
  const { mutateAsync: deleteDistrict, isPending: isDeleting } = useDeletePoliceDistrict();

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["police-districts"] });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDistrict(deleteTarget.id);
      toast.success("ລຶບສຳເລັດ");
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("ລຶບບໍ່ສຳເລັດ");
    } finally {
      onOpenChange();
      setDeleteTarget(null);
    }
  };

  if (mode === "create" || mode === "edit") {
    return (
      <DistrictForm
        editing={mode === "edit" ? editing : null}
        onBack={() => { setMode("list"); setEditing(null); }}
        onSaved={() => { setMode("list"); setEditing(null); refresh(); }}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-base font-bold text-gray-800">ປກສ ເມືອງທັງໝົດ</h2>
        <Button
          startContent={<Plus size={18} />}
          onPress={() => { setEditing(null); setMode("create"); }}
          className="bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl cursor-pointer"
        >
          ສ້າງ ປກສ ເມືອງ
        </Button>
      </div>

      {isLoading ? (
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
        </div>
      ) : districts.length === 0 ? (
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
          <Card className="shadow-sm border border-gray-100 rounded-3xl w-full max-w-md">
            <CardBody className="p-10 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Building2 size={28} className="text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-500">ຍັງບໍ່ມີ ປກສ ເມືອງ</p>
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left font-bold px-4 py-3">ຫົວໜ້າ</th>
                  <th className="text-left font-bold px-4 py-3">ຮອງຫົວໜ້າ</th>
                  <th className="text-left font-bold px-4 py-3">ຊື່ຜູ້ໃຊ້</th>
                  <th className="text-left font-bold px-4 py-3">ອີເມວ</th>
                  <th className="text-left font-bold px-4 py-3">ເບີໂທ</th>
                  <th className="text-right font-bold px-4 py-3">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {districts.map((d) => {
                  const acc = d.users?.[0];

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-[#075e3d]/10 flex items-center justify-center shrink-0">
                            <Building2 size={16} className="text-[#075e3d]" />
                          </div>
                          <span className="font-bold text-gray-800">{d.chiefName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{d.deputyChiefName}</td>
                      <td className="px-4 py-3 text-gray-600">{acc?.userName || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{acc?.email || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{acc?.phone || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setEditing(d); setMode("edit"); }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
                            title="ແກ້ໄຂ"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(d); onOpen(); }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                            title="ລຶບ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete confirm */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur">
        <ModalContent>
          <ModalBody className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg">ຢືນຢັນການລຶບ</h3>
            <p className="text-sm text-gray-500">
              ລຶບ ປກສ ເມືອງ “{deleteTarget?.chiefName}” ?<br />
              ບັນຊີຜູ້ໃຊ້ທີ່ກ່ຽວຂ້ອງຈະຍັງຄົງຢູ່.
            </p>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button variant="bordered" className="font-bold rounded-xl px-6" onPress={onOpenChange}>
              ຍົກເລີກ
            </Button>
            <Button
              isDisabled={isDeleting}
              onPress={handleDelete}
              className="bg-red-500 text-white font-bold rounded-xl px-6"
            >
              {isDeleting ? "ກຳລັງລຶບ..." : "ລຶບ"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function DistrictForm({
  editing,
  onBack,
  onSaved,
}: {
  editing: PoliceDistrictItem | null;
  onBack: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const { mutateAsync: createDistrict } = useCreatePoliceDistrict();
  const { mutateAsync: updateDistrict } = useUpdatePoliceDistrict();

  // Pre-fill from the linked user account when editing
  const acc0 = editing?.users?.[0];

  const [chiefName, setChiefName] = React.useState(editing?.chiefName || "");
  const [deputyChiefName, setDeputyChiefName] = React.useState(editing?.deputyChiefName || "");
  const [userName, setUserName] = React.useState(acc0?.userName || "");
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState(acc0?.email || "");
  const [phone, setPhone] = React.useState(acc0?.phone || "");
  const [districtId, setDistrictId] = React.useState(acc0?.districtId || "");
  const [villageId, setVillageId] = React.useState(acc0?.villageId || "");
  const [address, setAddress] = React.useState(acc0?.address || "");

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Province is inherited from the logged-in Police Department
  const { user: authData } = useAuth();
  const account = (authData as any)?.user;
  const deptProvinceId: string = account?.provinceId || "";

  const { data: provinces = [] } = useGetAllProvinces();
  const deptProvince = provinces.find((p: any) => p.id === deptProvinceId);
  const deptProvinceCode = deptProvince?.code || "";
  const { data: districts = [] } = useGetDistrictsByProvince(deptProvinceCode);
  // Derived so pre-filled districtId resolves its code for the village query
  const selectedDistrictCode = districts.find((d: any) => d.id === districtId)?.code || "";
  const { data: villages = [] } = useGetVillagesByDistrict(selectedDistrictCode);

  const handleSubmit = async () => {
    if (!chiefName.trim()) return toast.error("ກະລຸນາປ້ອນຊື່ຫົວໜ້າ");
    if (!deputyChiefName.trim()) return toast.error("ກະລຸນາປ້ອນຊື່ຮອງຫົວໜ້າ");
    if (!userName.trim()) return toast.error("ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້");
    // Password: required on create; on edit only validate when changing it
    if (!isEdit && password.length < 6) return toast.error("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ");
    if (isEdit && password && password.length < 6) return toast.error("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ");

    setIsSubmitting(true);
    try {
      if (isEdit && editing) {
        await updateDistrict({
          id: editing.id,
          payload: {
            chiefName: chiefName.trim(),
            deputyChiefName: deputyChiefName.trim(),
            userName: userName.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            provinceId: deptProvinceId || null,
            districtId: districtId || null,
            villageId: villageId || null,
            address: address.trim() || null,
            ...(password ? { password } : {}),
          },
        });
        toast.success("ບັນທຶກສຳເລັດ");
      } else {
        await createDistrict({
          chiefName: chiefName.trim(),
          deputyChiefName: deputyChiefName.trim(),
          userName: userName.trim(),
          password,
          email: email.trim() || null,
          phone: phone.trim() || null,
          provinceId: deptProvinceId || null,
          districtId: districtId || null,
          villageId: villageId || null,
          address: address.trim() || null,
        });
        toast.success("ສ້າງ ປກສ ເມືອງສຳເລັດ");
      }
      onSaved();
    } catch (err: any) {
      console.error("Save district failed:", err);
      toast.error(err?.response?.data?.message === "USER_ALREADY_EXISTS"
        ? "ຊື່ຜູ້ໃຊ້/ອີເມວ/ເບີໂທ ຖືກໃຊ້ແລ້ວ"
        : "ບັນທຶກບໍ່ສຳເລັດ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <ArrowLeft size={16} /> ກັບຄືນ
      </button>

      <Card className="shadow-sm border border-gray-100 rounded-3xl">
        <CardBody className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? "ແກ້ໄຂ ປກສ ເມືອງ" : "ສ້າງ ປກສ ເມືອງ"}
          </h2>

          {/* Office info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label htmlFor="pd-chief" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ຫົວໜ້າ / Chief *</label>
              <input id="pd-chief" type="text" value={chiefName} onChange={(e) => setChiefName(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="pd-deputy" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ຮອງຫົວໜ້າ / Deputy *</label>
              <input id="pd-deputy" type="text" value={deputyChiefName} onChange={(e) => setDeputyChiefName(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Account */}
          <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-[#075e3d] uppercase tracking-wide mb-3">ບັນຊີຜູ້ໃຊ້ / Account</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="pd-email" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ອີເມວ / Email</label>
                    <input id="pd-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="pd-phone" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ເບີໂທ / Phone</label>
                    <input id="pd-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">ແຂວງ / Province</span>
                    <div className={`${inputClass} bg-slate-100 text-gray-600 flex items-center`}>
                      {deptProvince?.nameLo || "— (ກົມບໍ່ໄດ້ກຳນົດແຂວງ)"}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="pd-district" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ເມືອງ / District</label>
                    <select
                      id="pd-district"
                      value={districtId}
                      onChange={(e) => {
                        setDistrictId(e.target.value);
                        setVillageId("");
                      }}
                      disabled={!deptProvinceCode}
                      className={`${inputClass} cursor-pointer disabled:opacity-60`}
                    >
                      <option value="">{deptProvinceCode ? "ເລືອກເມືອງ..." : "ບໍ່ມີຂໍ້ມູນແຂວງ"}</option>
                      {districts.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.nameLo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="pd-village" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ບ້ານ / Village</label>
                    <select
                      id="pd-village"
                      value={villageId}
                      onChange={(e) => setVillageId(e.target.value)}
                      disabled={!selectedDistrictCode}
                      className={`${inputClass} cursor-pointer disabled:opacity-60`}
                    >
                      <option value="">{selectedDistrictCode ? "ເລືອກບ້ານ..." : "ເລືອກເມືອງກ່ອນ..."}</option>
                      {villages.map((v: any) => (
                        <option key={v.id} value={v.id}>{v.nameLo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="pd-address" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ທີ່ຢູ່ / Address</label>
                    <input id="pd-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="pd-username" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ຊື່ຜູ້ໃຊ້ / Username *</label>
                    <input id="pd-username" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="pd-password" className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      ລະຫັດຜ່ານ / Password {isEdit ? "(ປ່ອຍວ່າງ = ບໍ່ປ່ຽນ)" : "*"}
                    </label>
                    <input id="pd-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEdit ? "••••••" : ""} className={inputClass} />
                  </div>
                </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onPress={onBack} variant="bordered" className="flex-1 font-bold rounded-2xl py-3 border-gray-300 text-gray-600 cursor-pointer">
              ຍົກເລີກ
            </Button>
            <Button
              onPress={handleSubmit}
              isDisabled={isSubmitting}
              className="flex-1 bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl py-3 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "ກຳລັງບັນທຶກ..." : isEdit ? "ບັນທຶກ ✓" : "ສ້າງ ✓"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
