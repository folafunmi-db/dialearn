// Outer covers open before retained internals; reverse traversal seats internals
// before closing covers. Every transform remains relative to its assembled pose.
export function assemblyShare(progress:number,cover:boolean){
 const t=Math.max(0,Math.min(1,cover?progress/.35:(progress-.18)/.82));
 return t*t*(3-2*t);
}
