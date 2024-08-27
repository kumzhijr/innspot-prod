const AmenityItem = ({children}: {children: React.ReactNode}) => {
    return ( 
    <div className="flex items-center justify-start px-4 gap-2">
    {children}
    </div> );
}
 
export default AmenityItem;