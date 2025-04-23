import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PlugZap } from "lucide-react";

interface SelectPortProps {
    value: number;
    onChange: (value: number) => void;
    commonPorts?: number[];
}

export function SelectPort({ value, onChange, commonPorts = [3000, 4000, 5000, 8000, 8080, 5173] }: SelectPortProps) {
    return (
        <Select value={`${value}`} onValueChange={(val) => onChange(Number(val))}>
            <SelectTrigger className="w-[120px]">
                <PlugZap />
                <SelectValue placeholder="Port" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Common Ports</SelectLabel>
                    {commonPorts.map((port) => (
                        <SelectItem key={port} value={`${port}`}>
                            {port}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}