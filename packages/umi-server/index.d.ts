import { IConfig, IContext, IResult } from './lib';

declare const IServer: (config: IConfig) => (ctx: IContext) => Promise<IResult>;

export = IServer;
