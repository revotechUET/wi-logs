# wi-logs

{
    index(*): "wi_backend",
    match: {
        username: "nam",
        level: "info",
        ...
    },
    time: {
        last: "15m"
    },
    fulltext: {
        message: "hello"
    }
}
