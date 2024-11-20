import status from "http-status-codes";

export const notFound = (req: any, res: { status: (arg0: any) => void; json: (arg0: { message: string; }) => void; end: () => void; }) => {
    res.status(status.NOT_FOUND);
    res.json({
        message: "Requested Resource Not Found",
    });
    res.end();
};

// handle internal server errors
export const internalServerError = (err: { status: any; message: any; extra: any; }, req: any, res: { status: (arg0: any) => void; json: (arg0: { success: boolean; message: any; extra: any; errors: any; }) => void; end: () => void; }) => {
    res.status(err.status ?? status.INTERNAL_SERVER_ERROR);
    res.json({
        success: false,
        message: err.message,
        extra: err.extra,
        errors: err,
    });
    res.end();
};