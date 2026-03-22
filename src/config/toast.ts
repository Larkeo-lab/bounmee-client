import { addToast } from "@heroui/react"

export type ToastColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
    title: string;
    description?: string;
    color?: ToastColor;
}

export const toastGlobal = (options: ToastOptions) => {
    const color = options.color || 'success';
    addToast({
        title: options.title,
        description: options.description,
        icon: true,
        color: color,
        classNames: {
            title: `text-lg font-bold text-${color}`,
            description: `text-sm text-${color} opacity-75`,
            base: `border-0 bg-white`,
            icon: `text-${color}`,
            closeButton: 'hidden',
        }
    })
}