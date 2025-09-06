import {
  type RouteConfig,
  route,
  index,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./home/page.tsx"),
  route("about", "./about/page.tsx"),
  route("freeplay", "./freeplay/page.tsx"),
  route("play", "./play/page.tsx"),
  route("songs", "./songs/page.tsx"),
  ...prefix("training", [
    route("phrases", "./training/phrases/page.tsx"),
    route("phrases", "./training/speed/page.tsx"),
  ]),
] satisfies RouteConfig;
