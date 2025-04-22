import Link from "next/link";

interface SidebarLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    isCollapsed: boolean;
}

export function SidebarLink({
    href,
    icon,
    label,
    isActive = false,
    isCollapsed,
}: SidebarLinkProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-800 ${isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? label : undefined}
        >
            {icon}
            {!isCollapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}
