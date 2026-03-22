import { useAuth } from "@/routes";
import {
    User,
    useDisclosure,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import ModalConfirm from "./common/modal-confirm";
import { Info, LogOut, MessageCircleQuestionMark, MessageSquareQuote, Settings } from "lucide-react";

export default function ProfileDropdown() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { logout, user: userProfile } = useAuth();

    // Handle logout actions
    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <Dropdown placement="bottom-end">
                <DropdownTrigger>
                    <User
                        as="button"
                        avatarProps={{
                            isBordered: true,
                            src: userProfile?.profileImage,
                            size: "sm",
                        }}
                        className="transition-transform cursor-pointer"
                        description={userProfile?.email}
                        name={<p className="font-bold">{userProfile?.firstName + " " + userProfile?.lastName}</p>}
                    />
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat" className="opacity-80 p-3">
                    <DropdownItem key="profile" className="h-14 gap-2">
                        <p className="font-bold">{userProfile?.firstName + " " + userProfile?.lastName}</p>
                        <p className="text-xs">{userProfile?.email}</p>
                    </DropdownItem>
                    <DropdownItem key="settings" startContent={<Settings size={18} />} >ການຕັ້ງຄ່າ</DropdownItem>
                    <DropdownItem key="help" startContent={<MessageCircleQuestionMark size={18} />} >ຊ່ວຍເຫຼືອ</DropdownItem>
                    <DropdownItem key="feedback" startContent={<MessageSquareQuote size={18} />} >ໃຫ້ຄຳຕິຊົມ</DropdownItem>
                    <DropdownItem
                        key="logout"
                        color="danger"
                        onPress={onOpen}
                        startContent={<LogOut size={18} />}
                    >
                        ອອກຈາກລະບົບ
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>

            {/* Modal confirm logout */}
            <ModalConfirm
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onConfirm={handleLogout}
                confirmText="ຕ້ອງການອອກ"
                cancelText="ບໍ່ຕ້ອງການ"
                content="ທ່ານຕ້ອງການອອກຈາກລະບົບແທ້ບໍ່?"
                title="ຢືນຢັນອອກຈາກລະບົບ"
                icon={<Info size={28} />}
            />
        </>
    );
}
