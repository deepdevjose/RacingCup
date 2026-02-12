"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    activeTab: string
    setActiveTab: (value: string) => void
} | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue: string
    value?: string
    onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
        const [activeTab, setActiveTabState] = React.useState(defaultValue)

        const currentTab = value !== undefined ? value : activeTab
        const handleTabChange = (newValue: string) => {
            if (onValueChange) {
                onValueChange(newValue)
            }
            setActiveTabState(newValue)
        }

        return (
            <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab: handleTabChange }}>
                <div ref={ref} className={cn("", className)} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        )
    }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            "bg-black/20 border border-white/10", // Custom
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (!context) throw new Error("TabsTrigger must be used within Tabs")

        const isActive = context.activeTab === value

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => context.setActiveTab(value)}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isActive
                        ? "bg-background text-foreground shadow-sm bg-[#E32636] text-white"
                        : "hover:bg-white/5 text-white/70",
                    className
                )}
                {...props}
            />
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (!context) throw new Error("TabsContent must be used within Tabs")

        if (context.activeTab !== value) return null

        return (
            <div
                ref={ref}
                className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
