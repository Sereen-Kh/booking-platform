import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>(
        () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    )

    useEffect(() => {
        const root = window.document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] text-amber-400" />
            )}
        </Button>
    )
}
