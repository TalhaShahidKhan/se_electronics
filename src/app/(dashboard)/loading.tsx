import { DelayedLoading } from "@/components";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <DelayedLoading />
        </div>
    );
}
