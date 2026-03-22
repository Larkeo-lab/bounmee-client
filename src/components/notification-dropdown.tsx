import React from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    ScrollShadow
} from "@heroui/react";
import { NotificationIcon } from "@/components/icons";
import { Check, Info, AlertTriangle, Bell } from "lucide-react";

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'info' | 'success' | 'warning';
    isRead: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: "1",
        title: "ສ້າງກະຊວງໃໝ່ສຳເລັດ",
        description: "ກະຊວງ 'ກະຊວງການເງິນ' ຖືກສ້າງຂຶ້ນແລ້ວ.",
        time: "2 ນາທີກ່ອນ",
        type: 'success',
        isRead: false,
    },
    {
        id: "2",
        title: "ການເຂົ້າລະບົບໃໝ່",
        description: "ມີການເຂົ້າລະບົບຈາກອຸປະກອນທີ່ບໍ່ຮູ້ຈັກ.",
        time: "1 ຊົ່ວໂມງກ່ອນ",
        type: 'warning',
        isRead: false,
    },
    {
        id: "3",
        title: "ອັບເດດລະບົບ",
        description: "ເວີຊັນ 1.2.0 ພ້ອມໃຊ້ງານແລ້ວ.",
        time: "5 ຊົ່ວໂມງກ່ອນ",
        type: 'info',
        isRead: true,
    },
    {
        id: "4",
        title: "ລາຍງານປະຈຳເດືອນ",
        description: "ລາຍງານປະຈຳເດືອນທັນວາພ້ອມດາວໂຫລດ.",
        time: "1 ມື້ກ່ອນ",
        type: 'info',
        isRead: true,
    }
];

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = React.useState(false);
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <div className="p-2 bg-success-100 rounded-full text-success"><Check size={16} /></div>;
            case 'warning': return <div className="p-2 bg-warning-100 rounded-full text-warning"><AlertTriangle size={16} /></div>;
            default: return <div className="p-2 bg-primary-100 rounded-full text-primary"><Info size={16} /></div>;
        }
    };

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
            placement="bottom-end"
            showArrow
            offset={10}
            motionProps={{
                variants: {
                    enter: {
                        y: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.2,
                            ease: "easeOut",
                        },
                    },
                    exit: {
                        y: -10,
                        opacity: 0,
                        transition: {
                            duration: 0.1,
                            ease: "easeIn",
                        },
                    },
                },
            }}
        >
            <PopoverTrigger>
                <div
                    className="cursor-pointer mt-2 transition-transform hover:scale-110 active:scale-95 outline-none"
                    onMouseEnter={() => setIsOpen(true)}
                >
                    <Badge color="danger" content={unreadCount} shape="circle" size="sm">
                        <NotificationIcon className="text-primary transition-colors" size={28} />
                    </Badge>
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none bg-transparent shadow-none" onMouseLeave={() => setIsOpen(false)}>
                <Card className="w-[350px] border-none shadow-2xl" radius="lg">
                    <CardHeader className="bg-primary flex justify-between items-center px-4 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-white" />
                            <h4 className="text-base font-bold text-white">ແຈ້ງເຕືອນ</h4>
                        </div>
                        {unreadCount > 0 && (
                            <span className="text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                                {unreadCount} ໃໝ່
                            </span>
                        )}
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-0">
                        <ScrollShadow className="max-h-[400px]">
                            <div className="flex flex-col">
                                {mockNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex gap-3 p-4 hover:bg-default-50 cursor-pointer transition-colors relative ${!notification.isRead ? 'bg-primary-50/30' : ''}`}
                                    >
                                        {!notification.isRead && (
                                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                        )}
                                        {getIcon(notification.type)}
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm leading-none ${!notification.isRead ? 'font-bold text-default-900' : 'text-default-700'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-default-500 line-clamp-2 pr-2">
                                                {notification.description}
                                            </p>
                                            <p className="text-[10px] text-default-400 font-medium pt-1">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollShadow>
                    </CardBody>
                    <Divider />
                    <div className="p-2 bg-default-50/50 flex justify-center">
                        <Button size="sm" variant="light" color="primary" className="font-bold text-xs" fullWidth>
                            ເບິ່ງທັງໝົດ
                        </Button>
                    </div>
                </Card>
            </PopoverContent>
        </Popover>
    );
}
