export default function DefaultPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[55vh] bg-white px-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
                {/* You are seeing the Default Page */}
                You don’t have access to any modules. Please contact admin.
            </h1>
            {/* <p className="text-gray-600 text-lg">
                You don’t have access to any modules. Please contact admin.
            </p> */}
        </div>
    );
}
