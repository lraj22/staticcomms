import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
	"base": "/staticcomms/",
	"plugins": [viteSingleFile()],
});
