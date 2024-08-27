'use client'

import qs from 'query-string'
import { Input } from "@/components/ui/input"
import { Filter, ListFilter, Search } from 'lucide-react'
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from "./ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import useLocation from "@/hooks/useLocation"
import { ICity, IState } from "country-state-city"
import { Button } from './ui/button'
import { useDebounceValue } from '@/hooks/useDebounceValue'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog'

const SearchWithFilters = () => {
    // Search state
    const searchParams = useSearchParams()
    const title = searchParams.get('title')
    const [value, setValue] = useState(title || '')
    const debounceValue = useDebounceValue<string>(value)

    // Location states
    const [country, setCountry] = useState('')
    const [state, setState] = useState('')
    const [city, setCity] = useState('')
    const [states, setStates] = useState<IState[]>([])
    const [cities, setCities] = useState<ICity[]>([])

    // Location hook
    const { getAllCountries, getCountryStates, getStateCities } = useLocation()
    const countries = getAllCountries()

    // Navigation
    const router = useRouter()
    const pathname = usePathname()

    // Dialog state
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const countryStates = getCountryStates(country)
        if (countryStates) {
            setStates(countryStates)
            setState('')
            setCity('')
        }
    }, [country])

    useEffect(() => {
        const stateCities = getStateCities(country, state)
        if (stateCities) {
            setCities(stateCities)
            setCity('')
        }
    }, [country, state])

    useEffect(() => {
        if (!debounceValue && country === '' && state === '' && city === '') return router.push('/')

        let currentQuery: any = {}

        if (searchParams) {
            currentQuery = qs.parse(searchParams.toString())
        }

        if (debounceValue) {
            currentQuery.title = debounceValue
        }

        if (country) {
            currentQuery.country = country
        }

        if (state) {
            currentQuery.state = state
        }

        if (city) {
            currentQuery.city = city
        }

        // Clean up query when filters are empty
        if (!debounceValue) {
            delete currentQuery.title
        }
        if (!state) {
            delete currentQuery.state
        }
        if (!city) {
            delete currentQuery.city
        }

        const url = qs.stringifyUrl({
            url: '/',
            query: currentQuery
        }, { skipNull: true, skipEmptyString: true })

        router.push(url)
    }, [debounceValue, country, state, city])

    // Clear all filters
    const handleClear = () => {
        router.push('/')
        setValue('')
        setCountry('')
        setState('')
        setCity('')
    }

    // Don't show when not on the homepage
    if (pathname !== '/') return null

    return (
        <div className="grow hidden sm:flex items-center justify-center gap-2 md:gap-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute h-4 w-4 top-2.5 left-4 text-muted-foreground" />
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Where To?" className="pl-10 bg-primary/10" />
            </div>

            {/* Filters Button */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                    <Button type="button" variant="outline">
                        <ListFilter />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[900px] w-[90%] flex-col gap-2 md:gap-4 justify-center mb-6">
                    <DialogHeader className='items-center'>
                        <DialogTitle>Refine Your Search</DialogTitle>
                    </DialogHeader>
                    <DialogDescription></DialogDescription>
                    <div className="flex gap-2 md:gap-4 items-center justify-center text-sm">
                        {/* Country Selector */}
                        <div>
                            <Select
                                onValueChange={(value) => setCountry(value)}
                                value={country}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder='Country' />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.isoCode} value={country.isoCode}>{country.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* State Selector */}
                        <div>
                            <Select
                                onValueChange={(value) => setState(value)}
                                value={state}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder='State' />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.length > 0 && states.map((state) => (
                                        <SelectItem key={state.isoCode} value={state.isoCode}>{state.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* City Selector */}
                        <div>
                            <Select
                                onValueChange={(value) => setCity(value)}
                                value={city}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder='City' />
                                </SelectTrigger>
                                <SelectContent>
                                    {cities.length > 0 && cities.map((city) => (
                                        <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className='flex items-center justify-center'>
                        <Button onClick={handleClear} variant="outline">Clear</Button>
                        <Button onClick={() => setOpen(false)}>Apply Filters</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default SearchWithFilters
