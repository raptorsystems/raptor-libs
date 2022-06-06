/* eslint-disable */
//prettier-ignore
module.exports = {
name: "@yarnpkg/plugin-docker",
factory: function (require) {
var plugin=(()=>{var st=Object.create,M=Object.defineProperty;var nt=Object.getOwnPropertyDescriptor;var ct=Object.getOwnPropertyNames;var pt=Object.getPrototypeOf,lt=Object.prototype.hasOwnProperty;var ft=t=>M(t,"__esModule",{value:!0});var n=t=>{if(typeof require!="undefined")return require(t);throw new Error('Dynamic require of "'+t+'" is not supported')};var mt=(t,e)=>{for(var o in e)M(t,o,{get:e[o],enumerable:!0})},dt=(t,e,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of ct(e))!lt.call(t,r)&&r!=="default"&&M(t,r,{get:()=>e[r],enumerable:!(o=nt(e,r))||o.enumerable});return t},c=t=>dt(ft(M(t!=null?st(pt(t)):{},"default",t&&t.__esModule&&"default"in t?{get:()=>t.default,enumerable:!0}:{value:t,enumerable:!0})),t);var yt={};mt(yt,{default:()=>kt});var ot=c(n("@yarnpkg/cli")),d=c(n("@yarnpkg/core")),et=c(n("@yarnpkg/fslib")),y=c(n("@yarnpkg/fslib")),rt=c(n("@yarnpkg/plugin-patch"));var R=c(n("@yarnpkg/fslib"));async function A({destination:t,dockerFilePath:e,report:o}){let r=e,i=R.ppath.join(t,(0,R.toFilename)("Dockerfile"));o.reportInfo(null,r),await R.xfs.copyPromise(i,r,{overwrite:!0})}var w=c(n("@yarnpkg/fslib"));async function U(t,e="Dockerfile"){let o=(0,w.toFilename)(e);if(w.ppath.isAbsolute(o))return o;let r=[w.ppath.join(t.cwd,o),w.ppath.join(t.project.cwd,o)];for(let i of r)if(await w.xfs.existsPromise(i))return i;throw new Error("Dockerfile is required")}var j=c(n("clipanion"));var u=c(n("@yarnpkg/fslib"));function ut(t,e){let o=u.npath.toPortablePath(e);return u.ppath.isAbsolute(o)?u.ppath.relative(t,o):o}async function T({destination:t,files:e,dockerFilePath:o,report:r}){let i=u.ppath.dirname(o);for(let a of e){let p=ut(i,a),f=u.ppath.join(i,p),s=u.ppath.join(t,p);r.reportInfo(null,p),await u.xfs.copyPromise(s,f)}}var D=c(n("@yarnpkg/fslib")),O=c(n("@yarnpkg/core"));async function E({destination:t,project:e,cache:o,report:r}){for(let i of o.markedFiles){let a=D.ppath.relative(e.cwd,i);await D.xfs.existsPromise(i)?(r.reportInfo(null,a),await D.xfs.copyPromise(D.ppath.join(t,a),i)):r.reportWarning(O.MessageName.UNUSED_CACHE_ENTRY,a)}}var F=c(n("@yarnpkg/fslib")),X=c(n("@yarnpkg/core"));async function q({destination:t,workspaces:e,report:o}){for(let r of e){let i=F.ppath.join(r.relativeCwd,X.Manifest.fileName),a=F.ppath.join(t,i),p={};r.manifest.exportTo(p),o.reportInfo(null,i),await F.xfs.mkdirpPromise(F.ppath.dirname(a)),await F.xfs.writeJsonPromise(a,p)}}var h=c(n("@yarnpkg/fslib"));async function N({destination:t,project:e,report:o}){let r=h.ppath.join((0,h.toFilename)(".yarn"),(0,h.toFilename)("plugins"));o.reportInfo(null,r),await h.xfs.copyPromise(h.ppath.join(t,r),h.ppath.join(e.cwd,r),{overwrite:!0})}var B=c(n("@yarnpkg/core")),k=c(n("@yarnpkg/fslib")),Pt=/^builtin<([^>]+)>$/;async function Y({destination:t,report:e,project:o,parseDescriptor:r}){let i=new Set;for(let a of o.storedDescriptors.values()){let p=B.structUtils.isVirtualDescriptor(a)?B.structUtils.devirtualizeDescriptor(a):a,f=r(p);if(!f)continue;let{parentLocator:s,paths:m}=f;for(let l of m){if(Pt.test(l)||k.ppath.isAbsolute(l))continue;let W=o.getWorkspaceByLocator(s),x=k.ppath.join(W.relativeCwd,l);if(i.has(x))continue;i.add(x);let g=k.ppath.join(W.cwd,l),P=k.ppath.join(t,x);e.reportInfo(null,x),await k.xfs.mkdirpPromise(k.ppath.dirname(P)),await k.xfs.copyFilePromise(g,P)}}}var L=c(n("@yarnpkg/fslib"));async function _({destination:t,project:e,report:o}){let r=e.configuration.get("rcFilename");o.reportInfo(null,r),await L.xfs.copyPromise(L.ppath.join(t,r),L.ppath.join(e.cwd,r),{overwrite:!0})}var C=c(n("@yarnpkg/fslib"));async function V({destination:t,project:e,report:o}){let r=e.configuration.get("yarnPath"),i=C.ppath.relative(e.cwd,r),a=C.ppath.join(t,i);o.reportInfo(null,i),await C.xfs.copyPromise(a,r,{overwrite:!0})}var $=c(n("@yarnpkg/core")),K=c(n("@yarnpkg/fslib"));function Q(t){let{params:e,selector:o}=$.structUtils.parseRange(t),r=K.npath.toPortablePath(o);return{parentLocator:e&&typeof e.locator=="string"?$.structUtils.parseLocator(e.locator):null,path:r}}var b=c(n("@yarnpkg/fslib"));async function z({destination:t,project:e,report:o}){let r=(0,b.toFilename)(e.configuration.get("lockfileFilename")),i=b.ppath.join(t,r);o.reportInfo(null,r),await b.xfs.mkdirpPromise(b.ppath.dirname(i)),await b.xfs.writeFilePromise(i,e.generateLockfile())}var Z=c(n("@yarnpkg/core"));function G({project:t,workspaces:e,production:o=!1,scopes:r=o?["dependencies"]:Z.Manifest.hardDependencies}){let i=new Set([...e]);for(let a of i)for(let p of r){let f=a.manifest.getForScope(p).values();for(let s of f){let m=t.tryWorkspaceByDescriptor(s);m&&i.add(m)}}for(let a of t.workspaces)i.has(a)?o&&a.manifest.devDependencies.clear():(a.manifest.dependencies.clear(),a.manifest.devDependencies.clear(),a.manifest.peerDependencies.clear());return i}var tt=c(n("@yarnpkg/core")),I=c(n("@yarnpkg/fslib")),H=c(n("@yarnpkg/plugin-pack"));async function J({workspace:t,destination:e,manifestDir:o,report:r}){await H.packUtils.prepareForPack(t,{report:r},async()=>{let i=await H.packUtils.genPackList(t),a=tt.Report.progressViaCounter(i.length),p=r.reportProgress(a);try{for(let f of i){let s=I.ppath.join(t.cwd,f);if(s.startsWith(o))continue;let m=I.ppath.join(e,t.relativeCwd,f);r.reportInfo(null,f),await I.xfs.copyPromise(m,s,{overwrite:!0}),a.tick()}}finally{p.stop()}})}var S=class extends ot.BaseCommand{constructor(){super(...arguments);this.workspaceName=j.Option.String();this.dockerFilePath=j.Option.String("-f,--file");this.buildDir=j.Option.String("-d,--dir","build");this.copyPackFiles=j.Option.Array("-cp,--copy-pack");this.copyManifestFiles=j.Option.Array("-cm,--copy-manifest")}async execute(){let e=await d.Configuration.find(this.context.cwd,this.context.plugins),{project:o}=await d.Project.find(e,this.context.cwd),r=o.getWorkspaceByIdent(d.structUtils.parseIdent(this.workspaceName)),i=G({project:o,workspaces:[r],production:!0}),a=await U(r,this.dockerFilePath),p=await d.Cache.find(e);return(await d.StreamReport.start({configuration:e,stdout:this.context.stdout,includeLogs:!this.context.quiet},async s=>{var x;await s.startTimerPromise("Resolution Step",async()=>{await o.resolveEverything({report:s,cache:p})}),await s.startTimerPromise("Fetch Step",async()=>{await o.fetchEverything({report:s,cache:p})});let m=y.ppath.join(this.context.cwd,y.npath.toPortablePath(this.buildDir));await s.startTimerPromise("Remove previous build",async()=>{await et.xfs.removePromise(m,{recursive:!0})});let l=y.ppath.join(m,(0,y.toFilename)("manifests")),W=y.ppath.join(m,(0,y.toFilename)("packs"));await s.startTimerPromise("Copy files",async()=>{var g;await _({destination:l,project:o,report:s}),await N({destination:l,project:o,report:s}),await V({destination:l,project:o,report:s}),await q({destination:l,workspaces:o.workspaces,report:s}),await Y({destination:l,report:s,project:o,parseDescriptor:P=>{if(P.range.startsWith("exec:")){let v=Q(P.range);return!v||!v.parentLocator?void 0:{parentLocator:v.parentLocator,paths:[v.path]}}else if(P.range.startsWith("patch:")){let{parentLocator:v,patchPaths:at}=rt.patchUtils.parseDescriptor(P);return v?{parentLocator:v,paths:at}:void 0}}}),await E({destination:l,project:o,cache:p,report:s}),await z({destination:l,project:o,report:s}),((g=this.copyManifestFiles)==null?void 0:g.length)&&await T({destination:l,files:this.copyManifestFiles,dockerFilePath:a,report:s})});for(let g of i){let P=g.manifest.name?d.structUtils.stringifyIdent(g.manifest.name):"";await s.startTimerPromise(`Pack workspace ${P}`,async()=>{await J({workspace:g,report:s,destination:W,manifestDir:l})})}((x=this.copyPackFiles)==null?void 0:x.length)&&await T({destination:W,files:this.copyPackFiles,dockerFilePath:a,report:s}),await A({destination:m,dockerFilePath:a,report:s})})).exitCode()}};S.usage=j.Command.Usage({category:"Docker-related commands",description:"Pack a workspace for Docker",details:`
      This command will pack a build dir which only contains production dependencies for the specified workspace.

      You can copy additional files or folders using the "--copy-pack/manifest" option. This is useful for secret keys or configuration files. The files will be copied to either the "manifests" or "packs" folders. The path can be either a path relative to the Dockerfile or an absolute path.
    `,examples:[["Pack a workspace for Docker","yarn docker pack @foo/bar"],["Copy additional files","yarn docker pack --copy-pack secret.key --copy-manifest config.json @foo/bar"]]}),S.paths=[["docker","pack"]];var it=S;var ht={commands:[it]},kt=ht;return yt;})();
return plugin;
}
};
