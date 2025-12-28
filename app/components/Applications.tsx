"use client";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function Applications() {
    return (
        <Link href="/applications" className="relative group">
            <div className="relative p-2 text-gray-600 group-hover:text-blue-600 transition-colors rounded-full group-hover:bg-gray-100">
                <FileText size={24} />
            </div>
        </Link>
    );
}
