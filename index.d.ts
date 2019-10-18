import { IConfig, IContext, IResult } from './lib';

type IServer = (config: IConfig) => (ctx: IContext) => Promise<IResult>;

export = IServer;
