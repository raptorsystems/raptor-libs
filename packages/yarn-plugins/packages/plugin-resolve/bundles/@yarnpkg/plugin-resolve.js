/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-resolve",
factory: function (require) {
"use strict";var plugin=(()=>{var r=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var u=Object.getOwnPropertyNames;var f=Object.prototype.hasOwnProperty;var c=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,o)=>(typeof require<"u"?require:e)[o]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+t+'" is not supported')});var w=(t,e)=>{for(var o in e)r(t,o,{get:e[o],enumerable:!0})},g=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of u(e))!f.call(t,a)&&a!==o&&r(t,a,{get:()=>e[a],enumerable:!(n=m(e,a))||n.enumerable});return t};var h=t=>g(r({},"__esModule",{value:!0}),t);var y={};w(y,{default:()=>v});var d=c("@yarnpkg/cli"),i=c("@yarnpkg/core"),l=c("clipanion"),s=class extends d.BaseCommand{async execute(){let e=await i.Configuration.find(this.context.cwd,this.context.plugins),{project:o}=await i.Project.find(e,this.context.cwd),n=await i.Cache.find(e);return(await i.StreamReport.start({configuration:e,stdout:this.context.stdout,includeLogs:!this.context.quiet},async p=>{await p.startTimerPromise("Resolution Step",async()=>{await o.resolveEverything({report:p,cache:n})})})).exitCode()}};s.usage=l.Command.Usage({category:"Resolve dependencies command",description:"Resolves all workspace dependencies",details:`
      This command will resolve all dependencies for the specified workspace.
    `,examples:[["Resolve workspace dependencies","yarn resolve @foo/bar"]]}),s.paths=[["resolve"]];var x={commands:[s]},v=x;return h(y);})();
return plugin;
}
};
