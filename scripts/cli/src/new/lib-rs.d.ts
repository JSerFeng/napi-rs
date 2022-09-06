export declare const LibRs = "#![deny(clippy::all)]\n\n#[macro_use]\nextern crate napi_derive;\n\n#[napi]\npub fn sum(a: i32, b: i32) -> i32 {\n  a + b\n}\n";
