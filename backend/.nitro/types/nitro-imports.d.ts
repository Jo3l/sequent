declare global {
  const appendCorsHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').appendCorsHeaders
  const appendCorsPreflightHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').appendCorsPreflightHeaders
  const appendHeader: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').appendHeader
  const appendHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').appendHeaders
  const appendResponseHeader: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').appendResponseHeader
  const appendResponseHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').appendResponseHeaders
  const assertMethod: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').assertMethod
  const cachedEventHandler: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/cache').cachedEventHandler
  const cachedFunction: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/cache').cachedFunction
  const callNodeListener: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').callNodeListener
  const clearResponseHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').clearResponseHeaders
  const clearSession: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').clearSession
  const computePHash: typeof import('../../server/utils/localCvDb').computePHash
  const countPdfPages: typeof import('../../server/utils/comicArchive').countPdfPages
  const coverPathFor: typeof import('../../server/utils/comicCover').coverPathFor
  const createApp: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').createApp
  const createAppEventHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').createAppEventHandler
  const createEnhanceJob: typeof import('../../server/utils/enhanceState').createEnhanceJob
  const createError: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').createError
  const createEvent: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').createEvent
  const createEventStream: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').createEventStream
  const createJob: typeof import('../../server/utils/scanState').createJob
  const createRouter: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').createRouter
  const createToken: typeof import('../../server/utils/jwt').createToken
  const defaultContentType: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defaultContentType
  const defineCachedEventHandler: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/cache').defineCachedEventHandler
  const defineCachedFunction: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/cache').defineCachedFunction
  const defineEventHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defineEventHandler
  const defineLazyEventHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defineLazyEventHandler
  const defineNitroErrorHandler: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/error/utils').defineNitroErrorHandler
  const defineNitroPlugin: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/plugin').defineNitroPlugin
  const defineNodeListener: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defineNodeListener
  const defineNodeMiddleware: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defineNodeMiddleware
  const defineRenderHandler: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/renderer').defineRenderHandler
  const defineRequestMiddleware: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defineRequestMiddleware
  const defineResponseMiddleware: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defineResponseMiddleware
  const defineRouteMeta: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/meta').defineRouteMeta
  const defineTask: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/task').defineTask
  const defineWebSocket: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defineWebSocket
  const defineWebSocketHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').defineWebSocketHandler
  const deleteCookie: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').deleteCookie
  const dynamicEventHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').dynamicEventHandler
  const eventHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').eventHandler
  const extractComicInfoXml: typeof import('../../server/utils/comicArchive').extractComicInfoXml
  const extractFirstPageImage: typeof import('../../server/utils/comicArchive').extractFirstPageImage
  const extractImageFromArchive: typeof import('../../server/utils/comicArchive').extractImageFromArchive
  const failEnhanceJob: typeof import('../../server/utils/enhanceState').failEnhanceJob
  const failJob: typeof import('../../server/utils/scanState').failJob
  const fetchWithEvent: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').fetchWithEvent
  const finishEnhanceJob: typeof import('../../server/utils/enhanceState').finishEnhanceJob
  const finishJob: typeof import('../../server/utils/scanState').finishJob
  const fromNodeMiddleware: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').fromNodeMiddleware
  const fromPlainHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').fromPlainHandler
  const fromWebHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').fromWebHandler
  const generateCover: typeof import('../../server/utils/comicCover').generateCover
  const getArchiveType: typeof import('../../server/utils/comicArchive').getArchiveType
  const getComicInfo: typeof import('../../server/utils/comicArchive').getComicInfo
  const getComicVineIssue: typeof import('../../server/utils/comicVine').getComicVineIssue
  const getCookie: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getCookie
  const getDataDir: typeof import('../../server/utils/db').getDataDir
  const getDataPath: typeof import('../../server/utils/db').getDataPath
  const getDb: typeof import('../../server/utils/db').getDb
  const getEnhanceJob: typeof import('../../server/utils/enhanceState').getEnhanceJob
  const getHeader: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getHeader
  const getHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getHeaders
  const getIssue: typeof import('../../server/utils/localCvDb').getIssue
  const getJob: typeof import('../../server/utils/scanState').getJob
  const getMethod: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getMethod
  const getProxyRequestHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getProxyRequestHeaders
  const getQuery: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getQuery
  const getRequestFingerprint: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestFingerprint
  const getRequestHeader: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestHeader
  const getRequestHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestHeaders
  const getRequestHost: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestHost
  const getRequestIP: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestIP
  const getRequestPath: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestPath
  const getRequestProtocol: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestProtocol
  const getRequestURL: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestURL
  const getRequestWebStream: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRequestWebStream
  const getResponseHeader: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getResponseHeader
  const getResponseHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getResponseHeaders
  const getResponseStatus: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getResponseStatus
  const getResponseStatusText: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getResponseStatusText
  const getRouteRules: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/route-rules').getRouteRules
  const getRouterParam: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRouterParam
  const getRouterParams: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getRouterParams
  const getSession: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getSession
  const getValidatedQuery: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getValidatedQuery
  const getValidatedRouterParams: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').getValidatedRouterParams
  const handleCacheHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').handleCacheHeaders
  const handleCors: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').handleCors
  const isComicFile: typeof import('../../server/utils/comicArchive').isComicFile
  const isCorsOriginAllowed: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').isCorsOriginAllowed
  const isEnhancing: typeof import('../../server/utils/enhanceState').isEnhancing
  const isError: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').isError
  const isEvent: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').isEvent
  const isEventHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').isEventHandler
  const isMethod: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').isMethod
  const isPreflightRequest: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').isPreflightRequest
  const isStream: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').isStream
  const isWebResponse: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').isWebResponse
  const lazyEventHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').lazyEventHandler
  const listArchiveImages: typeof import('../../server/utils/comicArchive').listArchiveImages
  const matchByFilename: typeof import('../../server/utils/localCvDb').matchByFilename
  const matchIssueByCoverHash: typeof import('../../server/utils/localCvDb').matchIssueByCoverHash
  const mountSmbShare: typeof import('../../server/utils/samba').mountSmbShare
  const nitroPlugin: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/plugin').nitroPlugin
  const normalizeFilename: typeof import('../../server/utils/filenameParser').normalizeFilename
  const parseComicInfoXml: typeof import('../../server/utils/comicArchive').parseComicInfoXml
  const parseCookies: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').parseCookies
  const parseFilename: typeof import('../../server/utils/filenameParser').parseFilename
  const promisifyNodeListener: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').promisifyNodeListener
  const proxyRequest: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').proxyRequest
  const readBody: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').readBody
  const readCoverMetadata: typeof import('../../server/utils/comicCover').readCoverMetadata
  const readFormData: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').readFormData
  const readMultipartFormData: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').readMultipartFormData
  const readRawBody: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').readRawBody
  const readValidatedBody: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').readValidatedBody
  const removeResponseHeader: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').removeResponseHeader
  const runTask: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/task').runTask
  const sanitizeStatusCode: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sanitizeStatusCode
  const sanitizeStatusMessage: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sanitizeStatusMessage
  const sanitizeTitle: typeof import('../../server/utils/localCvDb').sanitizeTitle
  const sealSession: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sealSession
  const searchByCoverHash: typeof import('../../server/utils/localCvDb').searchByCoverHash
  const searchComicVine: typeof import('../../server/utils/comicVine').searchComicVine
  const searchCoversByHash: typeof import('../../server/utils/localCvDb').searchCoversByHash
  const searchIssues: typeof import('../../server/utils/localCvDb').searchIssues
  const searchVolumes: typeof import('../../server/utils/localCvDb').searchVolumes
  const send: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').send
  const sendError: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sendError
  const sendIterable: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sendIterable
  const sendNoContent: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sendNoContent
  const sendProxy: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sendProxy
  const sendRedirect: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sendRedirect
  const sendStream: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sendStream
  const sendWebResponse: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').sendWebResponse
  const serveStatic: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').serveStatic
  const setCookie: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').setCookie
  const setHeader: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').setHeader
  const setHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').setHeaders
  const setResponseHeader: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').setResponseHeader
  const setResponseHeaders: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').setResponseHeaders
  const setResponseStatus: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').setResponseStatus
  const slugify: typeof import('../../server/utils/slugify').slugify
  const splitCookiesString: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').splitCookiesString
  const testSmbConnection: typeof import('../../server/utils/samba').testSmbConnection
  const titlesMatch: typeof import('../../server/utils/localCvDb').titlesMatch
  const toEventHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').toEventHandler
  const toNodeListener: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').toNodeListener
  const toPlainHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').toPlainHandler
  const toWebHandler: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').toWebHandler
  const toWebRequest: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').toWebRequest
  const unmountSmbShare: typeof import('../../server/utils/samba').unmountSmbShare
  const unsealSession: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').unsealSession
  const updateEnhanceJob: typeof import('../../server/utils/enhanceState').updateEnhanceJob
  const updateJob: typeof import('../../server/utils/scanState').updateJob
  const updateSession: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').updateSession
  const useAppConfig: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/config').useAppConfig
  const useBase: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').useBase
  const useEvent: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/context').useEvent
  const useNitroApp: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/app').useNitroApp
  const useRuntimeConfig: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/config').useRuntimeConfig
  const useSession: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').useSession
  const useStorage: typeof import('../../../node_modules/.pnpm/nitropack@2.13.4_better-sqlite3@11.10.0_oxc-parser@0.140.0_srvx@0.11.22_vite@5.4.21_@types+node@26.1.1_terser@5.49.0_/node_modules/nitropack/dist/runtime/internal/storage').useStorage
  const verifyToken: typeof import('../../server/utils/jwt').verifyToken
  const writeEarlyHints: typeof import('../../../node_modules/.pnpm/h3@1.15.11/node_modules/h3').writeEarlyHints
}
// for type re-export
declare global {
  // @ts-ignore
  export type { ComicMetadata } from '../../server/utils/comicArchive'
  import('../../server/utils/comicArchive')
  // @ts-ignore
  export type { CvSearchResult, CvIssueDetail } from '../../server/utils/comicVine'
  import('../../server/utils/comicVine')
  // @ts-ignore
  export type { EnhanceJob } from '../../server/utils/enhanceState'
  import('../../server/utils/enhanceState')
  // @ts-ignore
  export type { ParsedFilename } from '../../server/utils/filenameParser'
  import('../../server/utils/filenameParser')
  // @ts-ignore
  export type { JwtPayload } from '../../server/utils/jwt'
  import('../../server/utils/jwt')
  // @ts-ignore
  export type { CvIssue, MatchResult } from '../../server/utils/localCvDb'
  import('../../server/utils/localCvDb')
  // @ts-ignore
  export type { SmbMount } from '../../server/utils/samba'
  import('../../server/utils/samba')
  // @ts-ignore
  export type { ScanStats, ScanJob } from '../../server/utils/scanState'
  import('../../server/utils/scanState')
}
export { useNitroApp } from 'nitropack/runtime/internal/app';
export { useRuntimeConfig, useAppConfig } from 'nitropack/runtime/internal/config';
export { defineNitroPlugin, nitroPlugin } from 'nitropack/runtime/internal/plugin';
export { defineCachedFunction, defineCachedEventHandler, cachedFunction, cachedEventHandler } from 'nitropack/runtime/internal/cache';
export { useStorage } from 'nitropack/runtime/internal/storage';
export { defineRenderHandler } from 'nitropack/runtime/internal/renderer';
export { defineRouteMeta } from 'nitropack/runtime/internal/meta';
export { getRouteRules } from 'nitropack/runtime/internal/route-rules';
export { useEvent } from 'nitropack/runtime/internal/context';
export { defineTask, runTask } from 'nitropack/runtime/internal/task';
export { defineNitroErrorHandler } from 'nitropack/runtime/internal/error/utils';
export { appendCorsHeaders, appendCorsPreflightHeaders, appendHeader, appendHeaders, appendResponseHeader, appendResponseHeaders, assertMethod, callNodeListener, clearResponseHeaders, clearSession, createApp, createAppEventHandler, createError, createEvent, createEventStream, createRouter, defaultContentType, defineEventHandler, defineLazyEventHandler, defineNodeListener, defineNodeMiddleware, defineRequestMiddleware, defineResponseMiddleware, defineWebSocket, defineWebSocketHandler, deleteCookie, dynamicEventHandler, eventHandler, fetchWithEvent, fromNodeMiddleware, fromPlainHandler, fromWebHandler, getCookie, getHeader, getHeaders, getMethod, getProxyRequestHeaders, getQuery, getRequestFingerprint, getRequestHeader, getRequestHeaders, getRequestHost, getRequestIP, getRequestPath, getRequestProtocol, getRequestURL, getRequestWebStream, getResponseHeader, getResponseHeaders, getResponseStatus, getResponseStatusText, getRouterParam, getRouterParams, getSession, getValidatedQuery, getValidatedRouterParams, handleCacheHeaders, handleCors, isCorsOriginAllowed, isError, isEvent, isEventHandler, isMethod, isPreflightRequest, isStream, isWebResponse, lazyEventHandler, parseCookies, promisifyNodeListener, proxyRequest, readBody, readFormData, readMultipartFormData, readRawBody, readValidatedBody, removeResponseHeader, sanitizeStatusCode, sanitizeStatusMessage, sealSession, send, sendError, sendIterable, sendNoContent, sendProxy, sendRedirect, sendStream, sendWebResponse, serveStatic, setCookie, setHeader, setHeaders, setResponseHeader, setResponseHeaders, setResponseStatus, splitCookiesString, toEventHandler, toNodeListener, toPlainHandler, toWebHandler, toWebRequest, unsealSession, updateSession, useBase, useSession, writeEarlyHints } from 'h3';
export { getArchiveType, isComicFile, countPdfPages, extractComicInfoXml, parseComicInfoXml, getComicInfo, extractFirstPageImage, listArchiveImages, extractImageFromArchive } from '/home/jo3l/www/sequent/backend/server/utils/comicArchive';
export { generateCover, coverPathFor, readCoverMetadata } from '/home/jo3l/www/sequent/backend/server/utils/comicCover';
export { searchComicVine, getComicVineIssue } from '/home/jo3l/www/sequent/backend/server/utils/comicVine';
export { getDataDir, getDataPath, getDb } from '/home/jo3l/www/sequent/backend/server/utils/db';
export { createEnhanceJob, getEnhanceJob, updateEnhanceJob, finishEnhanceJob, failEnhanceJob, isEnhancing } from '/home/jo3l/www/sequent/backend/server/utils/enhanceState';
export { parseFilename, normalizeFilename } from '/home/jo3l/www/sequent/backend/server/utils/filenameParser';
export { createToken, verifyToken } from '/home/jo3l/www/sequent/backend/server/utils/jwt';
export { sanitizeTitle, titlesMatch, searchVolumes, searchIssues, searchByCoverHash, searchCoversByHash, getIssue, matchByFilename, computePHash, matchIssueByCoverHash } from '/home/jo3l/www/sequent/backend/server/utils/localCvDb';
export { mountSmbShare, unmountSmbShare, testSmbConnection } from '/home/jo3l/www/sequent/backend/server/utils/samba';
export { createJob, getJob, updateJob, finishJob, failJob } from '/home/jo3l/www/sequent/backend/server/utils/scanState';
export { slugify } from '/home/jo3l/www/sequent/backend/server/utils/slugify';