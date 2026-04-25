import { cyan, dim, green, yellow } from "kolorist";

export function info(message: string): void {
  console.log(cyan(message));
}

export function success(message: string): void {
  console.log(green(message));
}

export function note(message: string): void {
  console.log(dim(message));
}

export function warn(message: string): void {
  console.log(yellow(message));
}
