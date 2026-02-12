"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// import { Check, ChevronDown } from "lucide-react"

const SelectContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
} | null>(null)

interface SelectProps {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
}

const Select = ({ children, value, onValueChange, defaultValue }: SelectProps) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const [open, setOpen] = React.useState(false)

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const handleValueChange = (newValue: string) => {
        if (onValueChange) onValueChange(newValue)
        if (!isControlled) setInternalValue(newValue)
        setOpen(false)
    }

    return (
        <SelectContext.Provider value={{ value: currentValue || "", onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative inline-block w-full">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)

    return (
        <button
            ref={ref}
            type="button"
            onClick={() => context?.setOpen(!context.open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "bg-black/20 border-white/10 text-white",
                className
            )}
            {...props}
        >
            {children}
            {/* <ChevronDown className="h-4 w-4 opacity-50" /> */}
            <span className="opacity-50">▼</span>
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    // We need a way to display the label of the selected value, but we only have the value.
    // In a proper Select, we'd map value -> label.
    // For this lightweight version, we might just show the value if we can't find the child.
    // BUT the children are in SelectContent.
    // Limitation: This simple Select might show the raw 'value' instead of 'label' if we aren't careful.
    // The Admin code generally uses values that are readable or we can accept concise values.

    return (
        <span
            ref={ref}
            className={cn("block truncate", className)}
            {...props}
        >
            {context?.value || placeholder}
        </span>
    )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context?.open) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => context.setOpen(false)}
            />
            <div
                ref={ref}
                className={cn(
                    "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
                    "bg-[#151525] border-white/10 text-white mt-1 w-full",
                    className
                )}
                {...props}
            >
                <div className="p-1">
                    {children}
                </div>
            </div>
        </>
    )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    const isSelected = context?.value === value

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                "hover:bg-white/10 cursor-pointer",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                context?.onValueChange(value)
            }}
            {...props}
        >
            {isSelected && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {/* <Check className="h-4 w-4" /> */}
                    ✓
                </span>
            )}
            <span className="truncate">{children}</span>
        </div>
    )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
