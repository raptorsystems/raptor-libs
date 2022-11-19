/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-resolve",
factory: function (require) {
"use strict";var plugin=(()=>{var r=Object.defineProperty;var u=Object.getOwnPropertyDescriptor;var f=Object.getOwnPropertyNames;var w=Object.prototype.hasOwnProperty;var g=(t,e,o)=>e in t?r(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o;var c=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,o)=>(typeof require<"u"?require:e)[o]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+t+'" is not supported')});var h=(t,e)=>{for(var o in e)r(t,o,{get:e[o],enumerable:!0})},x=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of f(e))!w.call(t,a)&&a!==o&&r(t,a,{get:()=>e[a],enumerable:!(n=u(e,a))||n.enumerable});return t};var v=t=>x(r({},"__esModule",{value:!0}),t);var p=(t,e,o)=>(g(t,typeof e!="symbol"?e+"":e,o),o);var b={};h(b,{default:()=>P});var l=c("@yarnpkg/cli"),i=c("@yarnpkg/core"),m=c("clipanion");var s=class extends l.BaseCommand{async execute(){let e=await i.Configuration.find(this.context.cwd,this.context.plugins),{project:o}=await i.Project.find(e,this.context.cwd),n=await i.Cache.find(e);return(await i.StreamReport.start({configuration:e,stdout:this.context.stdout,includeLogs:!this.context.quiet},async d=>{await d.startTimerPromise("Resolution Step",async()=>{await o.resolveEverything({report:d,cache:n})})})).exitCode()}};p(s,"usage",m.Command.Usage({category:"Resolve dependencies command",description:"Resolves all workspace dependencies",details:`
      This command will resolve all dependencies for the specified workspace.
    `,examples:[["Resolve workspace dependencies","yarn resolve @foo/bar"]]})),p(s,"paths",[["resolve"]]);var y={commands:[s]},P=y;return v(b);})();
return plugin;
}
};
