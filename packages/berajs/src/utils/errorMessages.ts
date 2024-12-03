import { ethers } from "ethers";
import { PublicClient } from "viem";

import { clientToProvider } from "./ethers-client-to-provider";

interface ErrorType {
  keywords: string[];
  errorMSG: string;
}

interface ErrorCategory {
  [key: string]: ErrorType;
}

interface ErrorMessages {
  GENERAL_ERROR: string;
  [key: string]: ErrorCategory | string;
}

const errorMsgMap: ErrorMessages = {
  GENERAL_ERROR: "Something went wrong. Please try again later.",
  RPC: {
    GAS_PRICE: {
      keywords: ["gasLimit"],
      errorMSG:
        "It seems an RPC error has occurred while estimating gas. Please try your request later.",
    },
    JSON_RPC: {
      keywords: ["JSON-RPC"],
      errorMSG:
        "It seems an RPC error has occurred. Please try your request one more later.",
    },
    // ETH_GETBALANCE: {
    //   keywords: "eth_getBalance",
    //   err: "An RPC error has been detected. Please attempt your request after a short while.",
    // },
    HASH: {
      keywords: ["hash"],
      errorMSG:
        "It seems an RPC error has occurred. Please check if your transaction was finalized. If not, please try again.",
    },
    USER_REJECTION: {
      keywords: ["User denied transaction signature"],
      errorMSG: "You rejected the transaction.",
    },
  },
  // NOTE: these codes are from https://github.com/balancer/balancer-v2-monorepo/blob/master/pkg/balancer-js/src/utils/errors.ts
  // ... and additionally from https://docs.balancer.fi/reference/contracts/error-codes.html
  // NOTE: descriptions are generated by GPT where not available.
  BALANCER: {
    // math
    BAL000: {
      keywords: ["BAL#000"],
      errorMSG: "Addition overflow occurred during calculation. (BEX#000)",
    },
    BAL001: {
      keywords: ["BAL#001"],
      errorMSG: "Subtraction overflow occurred during calculation. (BEX#001)",
    },
    BAL002: {
      keywords: ["BAL#002"],
      errorMSG: "Subtraction underflow occurred during calculation. (BEX#002)",
    },
    BAL003: {
      keywords: ["BAL#003"],
      errorMSG:
        "Multiplication overflow occurred during calculation. (BEX#003)",
    },
    BAL004: {
      keywords: ["BAL#004"],
      errorMSG: "Attempted division by zero. (BEX#004)",
    },
    BAL005: {
      keywords: ["BAL#005"],
      errorMSG: "Multiplication overflow during FixedPoint Division. (BEX#005)",
    },
    BAL006: {
      keywords: ["BAL#006"],
      errorMSG: "Invalid x in ExpMath.pow(x, y). (BEX#006)",
    },
    BAL007: {
      keywords: ["BAL#007"],
      errorMSG: "Invalid y in ExpMath.pow(x, y). (BEX#007)",
    },
    BAL008: {
      keywords: ["BAL#008"],
      errorMSG:
        "In LogExpMath.pow(x, y), error computing x^y as exp(y * ln(x)). (BEX#008)",
    },
    BAL009: {
      keywords: ["BAL#009"],
      errorMSG: "In LogExpMath.exp(x) = e^x; x out of bounds. (BEX#009)",
    },
    // Input
    BAL100: {
      keywords: ["BAL#100"],
      errorMSG: "Value is out of acceptable bounds. (BEX#100)",
    },
    BAL101: {
      keywords: ["BAL#101"],
      errorMSG:
        "Tokens must be sorted in address order on pool registration. (BEX#101)",
    },
    BAL102: {
      keywords: ["BAL#102"],
      errorMSG:
        "Tokens must be sorted in address order on pool registration. (BEX#102)",
    },
    BAL103: {
      keywords: ["BAL#103"],
      errorMSG: "Parallel array inputs must have the same length. (BEX#103)",
    },
    BAL104: {
      keywords: ["BAL#104"],
      errorMSG: "Address to be interpreted as a token cannot be 0. (BEX#104)",
    },
    BAL105: {
      keywords: ["BAL#105"],
      errorMSG: "Insufficient byte length. (BEX#105)",
    },
    // Shared Pools
    BAL200: {
      keywords: ["BAL#200"],
      errorMSG: "All pools must contain at least two tokens. (BEX#200)",
    },
    BAL201: {
      keywords: ["BAL#201"],
      errorMSG:
        "Token count exceeds the maximum for a given pool type. (BEX#201)",
    },
    BAL202: {
      keywords: ["BAL#202"],
      errorMSG: "Swap fee percentage exceeds the maximum allowed. (BEX#202)",
    },
    BAL203: {
      keywords: ["BAL#203"],
      errorMSG: "Swap fee percentage is below the minimum allowed. (BEX#203)",
    },
    BAL204: {
      keywords: ["BAL#204"],
      errorMSG:
        "Pool initialization failed: a small amount of BPT is minted to the zero address to maintain mathematical consistency. If initial balances are too low, the initialization process may fail. (BEX#204)",
    },
    BAL205: {
      keywords: ["BAL#205"],
      errorMSG:
        "User attempted to execute a callback intended for the vault contract. (BEX#205)",
    },
    BAL206: {
      keywords: ["BAL#206"],
      errorMSG:
        "Pools must be initialized with a special 'Init' join, before they can be joined by LPs. (BEX#206)",
    },
    BAL207: {
      keywords: ["BAL#207"],
      errorMSG:
        "Slippage/front-running protection check failed on a pool exit. (BEX#207)",
    },
    BAL208: {
      keywords: ["BAL#208"],
      errorMSG: "Minimum BPT output amount not met. (BEX#208)",
    },
    BAL209: {
      keywords: ["BAL#209"],
      errorMSG:
        "Slippage/front-running protection check failed on a pool join. (BEX#209)",
    },
    BAL210: {
      keywords: ["BAL#210"],
      errorMSG:
        "Pools with oracles are limited to two tokens. A pool with the TWO_TOKEN specialization must have exactly two tokens. (BEX#210)",
    },
    BAL211: {
      keywords: ["BAL#211"],
      errorMSG:
        "The pool factory is disabled and new pools cannot be created at this time. (BEX#211)",
    },
    // Pools
    BAL300: {
      keywords: ["BAL#300"],
      errorMSG:
        "The amplification parameter is below the minimum allowed. (BEX#300)",
    },
    BAL301: {
      keywords: ["BAL#301"],
      errorMSG:
        "The amplification parameter exceeds the maximum allowed. (BEX#301)",
    },
    BAL302: {
      keywords: ["BAL#302"],
      errorMSG: "The weight parameter is below the minimum allowed. (BEX#302)",
    },
    BAL303: {
      keywords: ["BAL#303"],
      errorMSG:
        "The number of stable tokens exceeds the maximum allowed. (BEX#303)",
    },
    BAL304: {
      keywords: ["BAL#304"],
      errorMSG: "The amount of tokens in would unbalance the pool. (BEX#304)",
    },
    BAL305: {
      keywords: ["BAL#305"],
      errorMSG: "The amount of tokens out would unbalance the pool. (BEX#305)",
    },
    BAL306: {
      keywords: ["BAL#306"],
      errorMSG:
        "Disproportionate pool exit would unbalance the pool. (BEX#306)",
    },
    BAL307: {
      keywords: ["BAL#307"],
      errorMSG:
        "Disproportionate pool join would unbalance the pool. (BEX#307)",
    },
    BAL308: {
      keywords: ["BAL#308"],
      errorMSG: "Normalized weights do not add to 1.0 exactly. (BEX#308)",
    },
    BAL309: {
      keywords: ["BAL#309"],
      errorMSG: "Invalid token provided for operation. (BEX#309)",
    },
    BAL310: {
      keywords: ["BAL#310"],
      errorMSG: "Unhandled pool join operation for this pool type. (BEX#310)",
    },
    BAL311: {
      keywords: ["BAL#311"],
      errorMSG: "Pool balances must be > 0. (BEX#311)",
    },
    BAL312: {
      keywords: ["BAL#312"],
      errorMSG:
        "Invalid query for oracle data ('ago' timestamp was not in the past). (BEX#312)",
    },
    BAL313: {
      keywords: ["BAL#313"],
      errorMSG: "Oracle has no data to query. (BEX#313)",
    },
    BAL314: {
      keywords: ["BAL#314"],
      errorMSG:
        "Oracle query data is before its earliest data sample. (BEX#314)",
    },
    BAL315: {
      keywords: ["BAL#315"],
      errorMSG:
        "Cannot query an oracle sample outside the buffer of 1024. (BEX#315)",
    },
    BAL316: {
      keywords: ["BAL#316"],
      errorMSG: "Oracle query window must have non-zero duration. (BEX#316)",
    },
    BAL317: {
      keywords: ["BAL#317"],
      errorMSG:
        "Amplification parameter change has less than the minimum duration. (BEX#317)",
    },
    BAL318: {
      keywords: ["BAL#318"],
      errorMSG:
        "Cannot start an amplification parameter update if one is already ongoing. (BEX#318)",
    },
    BAL319: {
      keywords: ["BAL#319"],
      errorMSG:
        "The requested amplification parameter change is too fast (cannot halve or double over less than a day). (BEX#319)",
    },
    BAL320: {
      keywords: ["BAL#320"],
      errorMSG:
        "Cannot cancel an update if there isn't one already ongoing. (BEX#320)",
    },
    BAL321: {
      keywords: ["BAL#321"],
      errorMSG: "Stable pool invariant calculation did not converge. (BEX#321)",
    },
    BAL322: {
      keywords: ["BAL#322"],
      errorMSG: "Stable pool balance calculation did not converge. (BEX#322)",
    },
    BAL323: {
      keywords: ["BAL#323"],
      errorMSG: "Relayer must be a valid contract. (BEX#323)",
    },
    BAL324: {
      keywords: ["BAL#324"],
      errorMSG: "Base pool relayer was not called correctly. (BEX#324)",
    },
    BAL325: {
      keywords: ["BAL#325"],
      errorMSG:
        "Rebalancing relayer operation re-entered unexpectedly. (BEX#325)",
    },
    BAL326: {
      keywords: ["BAL#326"],
      errorMSG:
        "Detected time travel in gradual updates (start > end time in a gradual weights update). (BEX#326)",
    },
    BAL327: {
      keywords: ["BAL#327"],
      errorMSG: "Swaps are disabled for this pool. (BEX#327)",
    },
    BAL328: {
      keywords: ["BAL#328"],
      errorMSG: "Caller is not the owner of the LBP. (BEX#328)",
    },
    BAL329: {
      keywords: ["BAL#329"],
      errorMSG:
        "Rate returned from a rateProvider must fit within 128 bits. (BEX#329)",
    },
    BAL330: {
      keywords: ["BAL#330"],
      errorMSG:
        "Investment pools only allow proportional joins and exits when swaps are disabled (to prevent unbalancing the pool). (BEX#330)",
    },
    BAL331: {
      keywords: ["BAL#331"],
      errorMSG:
        "Gradual weight update duration too short (minimum 1 day). (BEX#331)",
    },
    BAL332: {
      keywords: ["BAL#332"],
      errorMSG: "Invalid Linear Pool operating range. (BEX#332)",
    },
    BAL333: {
      keywords: ["BAL#333"],
      errorMSG: "Linear Pool max balance must fit in 112 bits. (BEX#333)",
    },
    BAL334: {
      keywords: ["BAL#334"],
      errorMSG:
        "Unhandled pool join/exit operation for linear pool type. (BEX#334)",
    },
    BAL335: {
      keywords: ["BAL#335"],
      errorMSG:
        "Cannot reset Linear Pool targets if pool is unbalanced. (BEX#335)",
    },
    BAL336: {
      keywords: ["BAL#336"],
      errorMSG: "Unhandled pool exit operation for this pool type. (BEX#336)",
    },
    BAL337: {
      keywords: ["BAL#337"],
      errorMSG:
        "Management fees can only be collected by the pool owner. (BEX#337)",
    },
    BAL338: {
      keywords: ["BAL#338"],
      errorMSG:
        "Management swap fee percentage exceeded the maximum. (BEX#338)",
    },
    BAL339: {
      keywords: ["BAL#339"],
      errorMSG:
        "Unhandled pool join/exit operation for managed pool type. (BEX#339)",
    },
    BAL340: {
      keywords: ["BAL#340"],
      errorMSG:
        "Unhandled pool join/exit operation for phantom pool type. (BEX#340)",
    },
    BAL341: {
      keywords: ["BAL#341"],
      errorMSG: "Token does not have a valid rate provider. (BEX#341)",
    },
    BAL342: {
      keywords: ["BAL#342"],
      errorMSG: "Invalid pool initialization parameters provided. (BEX#342)",
    },
    BAL343: {
      keywords: ["BAL#343"],
      errorMSG:
        "Value is out of the new target range for the operation. (BEX#343)",
    },
    BAL344: {
      keywords: ["BAL#344"],
      errorMSG: "This feature is currently disabled. (BEX#344)",
    },
    BAL345: {
      keywords: ["BAL#345"],
      errorMSG: "The pool controller is uninitialized. (BEX#345)",
    },
    BAL346: {
      keywords: ["BAL#346"],
      errorMSG: "Cannot set swap fee during an ongoing fee change. (BEX#346)",
    },
    BAL347: {
      keywords: ["BAL#347"],
      errorMSG: "Cannot set swap fee during pending fee changes. (BEX#347)",
    },
    BAL348: {
      keywords: ["BAL#348"],
      errorMSG: "Cannot change tokens during a weight change. (BEX#348)",
    },
    BAL349: {
      keywords: ["BAL#349"],
      errorMSG: "Cannot change tokens during pending weight changes. (BEX#349)",
    },
    BAL350: {
      keywords: ["BAL#350"],
      errorMSG: "Weight parameter exceeds the maximum allowed. (BEX#350)",
    },
    BAL351: {
      keywords: ["BAL#351"],
      errorMSG: "Unauthorized join operation. (BEX#351)",
    },
    BAL352: {
      keywords: ["BAL#352"],
      errorMSG:
        "Management AUM fee percentage exceeded the maximum allowed. (BEX#352)",
    },
    BAL353: {
      keywords: ["BAL#353"],
      errorMSG: "Fractional target values are not supported. (BEX#353)",
    },
    BAL354: {
      keywords: ["BAL#354"],
      errorMSG:
        "Adding or removing BPT is not allowed in this context. (BEX#354)",
    },
    BAL355: {
      keywords: ["BAL#355"],
      errorMSG: "Invalid circuit breaker bounds configuration. (BEX#355)",
    },
    BAL356: {
      keywords: ["BAL#356"],
      errorMSG: "The circuit breaker has been triggered. (BEX#356)",
    },
    BAL357: {
      keywords: ["BAL#357"],
      errorMSG: "Malicious query detected and reverted. (BEX#357)",
    },
    BAL358: {
      keywords: ["BAL#358"],
      errorMSG:
        "Joins and exits are currently disabled for this pool. (BEX#358)",
    },
    // Lib
    BAL400: {
      keywords: ["BAL#400"],
      errorMSG: "Reentrancy detected. (BEX#400)",
    },
    BAL401: {
      keywords: ["BAL#401"],
      errorMSG: "The sender is not allowed to perform this action. (BEX#401)",
    },
    BAL402: {
      keywords: ["BAL#402"],
      errorMSG: "The contract is currently paused. (BEX#402)",
    },
    BAL403: {
      keywords: ["BAL#403"],
      errorMSG: "The pause window has expired. (BEX#403)",
    },
    BAL404: {
      keywords: ["BAL#404"],
      errorMSG:
        "The maximum pause window duration has been exceeded. (BEX#404)",
    },
    BAL405: {
      keywords: ["BAL#405"],
      errorMSG:
        "The maximum buffer period duration has been exceeded. (BEX#405)",
    },
    BAL406: {
      keywords: ["BAL#406"],
      errorMSG: "The account has insufficient balance. (BEX#406)",
    },
    BAL407: {
      keywords: ["BAL#407"],
      errorMSG: "The account has insufficient allowance. (BEX#407)",
    },
    BAL408: {
      keywords: ["BAL#408"],
      errorMSG: "ERC20: Transfer from zero address. (BEX#408)",
    },
    BAL409: {
      keywords: ["BAL#409"],
      errorMSG: "ERC20: Transfer to zero address. (BEX#409)",
    },
    BAL410: {
      keywords: ["BAL#410"],
      errorMSG: "ERC20: Mint to zero address. (BEX#410)",
    },
    BAL411: {
      keywords: ["BAL#411"],
      errorMSG: "ERC20: Burn from zero address. (BEX#411)",
    },
    BAL412: {
      keywords: ["BAL#412"],
      errorMSG: "ERC20: Approve from zero address. (BEX#412)",
    },
    BAL413: {
      keywords: ["BAL#413"],
      errorMSG: "ERC20: Approve to zero address. (BEX#413)",
    },
    BAL414: {
      keywords: ["BAL#414"],
      errorMSG: "ERC20: Transfer exceeds allowance. (BEX#414)",
    },
    BAL415: {
      keywords: ["BAL#415"],
      errorMSG: "ERC20: Decreased allowance below zero. (BEX#415)",
    },
    BAL416: {
      keywords: ["BAL#416"],
      errorMSG: "ERC20: Transfer exceeds balance. (BEX#416)",
    },
    BAL417: {
      keywords: ["BAL#417"],
      errorMSG: "ERC20: Burn exceeds allowance. (BEX#417)",
    },
    BAL418: {
      keywords: ["BAL#418"],
      errorMSG: "SafeERC20: Call failed. (BEX#418)",
    },
    BAL419: {
      keywords: ["BAL#419"],
      errorMSG: "Address has insufficient balance. (BEX#419)",
    },
    BAL420: {
      keywords: ["BAL#420"],
      errorMSG: "Address cannot send value. (BEX#420)",
    },
    BAL421: {
      keywords: ["BAL#421"],
      errorMSG: "SafeCast: Value cannot fit into int256. (BEX#421)",
    },
    BAL422: {
      keywords: ["BAL#422"],
      errorMSG: "AccessControl: Grant sender is not an admin. (BEX#422)",
    },
    BAL423: {
      keywords: ["BAL#423"],
      errorMSG: "AccessControl: Revoke sender is not an admin. (BEX#423)",
    },
    BAL424: {
      keywords: ["BAL#424"],
      errorMSG:
        "AccessControl: Renounce sender not allowed for accounts other than self. (BEX#424)",
    },
    BAL425: {
      keywords: ["BAL#425"],
      errorMSG: "Buffer period has expired. (BEX#425)",
    },
    BAL426: {
      keywords: ["BAL#426"],
      errorMSG: "Caller is not the owner. (BEX#426)",
    },
    BAL427: {
      keywords: ["BAL#427"],
      errorMSG: "New owner cannot be zero address. (BEX#427)",
    },
    BAL428: {
      keywords: ["BAL#428"],
      errorMSG: "Code deployment failed. (BEX#428)",
    },
    BAL429: {
      keywords: ["BAL#429"],
      errorMSG: "Call to non-contract address. (BEX#429)",
    },
    BAL430: {
      keywords: ["BAL#430"],
      errorMSG: "Low-level call failed. (BEX#430)",
    },
    BAL431: {
      keywords: ["BAL#431"],
      errorMSG: "The contract is not paused. (BEX#431)",
    },
    BAL432: {
      keywords: ["BAL#432"],
      errorMSG: "Address is already allowlisted. (BEX#432)",
    },
    BAL433: {
      keywords: ["BAL#433"],
      errorMSG: "Address is not allowlisted. (BEX#433)",
    },
    BAL434: {
      keywords: ["BAL#434"],
      errorMSG: "ERC20: Burn exceeds balance. (BEX#434)",
    },
    BAL435: {
      keywords: ["BAL#435"],
      errorMSG: "Invalid operation. (BEX#435)",
    },
    BAL436: {
      keywords: ["BAL#436"],
      errorMSG: "Codec overflow detected. (BEX#436)",
    },
    BAL437: {
      keywords: ["BAL#437"],
      errorMSG: "The system is in recovery mode. (BEX#437)",
    },
    BAL438: {
      keywords: ["BAL#438"],
      errorMSG: "The system is not in recovery mode. (BEX#438)",
    },
    BAL439: {
      keywords: ["BAL#439"],
      errorMSG: "Induced failure. (BEX#439)",
    },
    BAL440: {
      keywords: ["BAL#440"],
      errorMSG: "Expired signature. (BEX#440)",
    },
    BAL441: {
      keywords: ["BAL#441"],
      errorMSG: "Malformed signature. (BEX#441)",
    },
    BAL442: {
      keywords: ["BAL#442"],
      errorMSG: "SafeCast: Value cannot fit into uint64. (BEX#442)",
    },
    BAL443: {
      keywords: ["BAL#443"],
      errorMSG: "Unhandled fee type. (BEX#443)",
    },
    BAL444: {
      keywords: ["BAL#444"],
      errorMSG: "ERC20: Burn from zero address. (BEX#444)",
    },
    // Vault
    BAL500: {
      keywords: ["BAL#500"],
      errorMSG: "Invalid pool ID. (BEX#500)",
    },
    BAL501: {
      keywords: ["BAL#501"],
      errorMSG: "Caller is not the pool. (BEX#501)",
    },
    BAL502: {
      keywords: ["BAL#502"],
      errorMSG: "Sender is not the asset manager. (BEX#502)",
    },
    BAL503: {
      keywords: ["BAL#503"],
      errorMSG: "User does not allow the relayer. (BEX#503)",
    },
    BAL504: {
      keywords: ["BAL#504"],
      errorMSG: "Invalid signature. (BEX#504)",
    },
    BAL505: {
      keywords: ["BAL#505"],
      errorMSG: "Exit would yield fewer than the minimum tokens out. (BEX#505)",
    },
    BAL506: {
      keywords: ["BAL#506"],
      errorMSG: "Join would cost more than the maximum tokens in. (BEX#506)",
    },
    BAL507: {
      keywords: ["BAL#507"],
      errorMSG: "Swap violates user-supplied limits. (BEX#507)",
    },
    BAL508: {
      keywords: ["BAL#508"],
      errorMSG: "Swap transaction not mined within the deadline. (BEX#508)",
    },
    BAL509: {
      keywords: ["BAL#509"],
      errorMSG: "Cannot swap the same token. (BEX#509)",
    },
    BAL510: {
      keywords: ["BAL#510"],
      errorMSG: "Unknown amount in the first swap of a batch. (BEX#510)",
    },
    BAL511: {
      keywords: ["BAL#511"],
      errorMSG: "Malconstructed multihop swap. (BEX#511)",
    },
    BAL512: {
      keywords: ["BAL#512"],
      errorMSG: "Internal balance overflow. (BEX#512)",
    },
    BAL513: {
      keywords: ["BAL#513"],
      errorMSG: "Insufficient internal balance. (BEX#513)",
    },
    BAL514: {
      keywords: ["BAL#514"],
      errorMSG: "Invalid ETH internal balance. (BEX#514)",
    },
    BAL515: {
      keywords: ["BAL#515"],
      errorMSG:
        "Flashloan must repay the loan in the same transaction. (BEX#515)",
    },
    BAL516: {
      keywords: ["BAL#516"],
      errorMSG: "Insufficient ETH balance. (BEX#516)",
    },
    BAL517: {
      keywords: ["BAL#517"],
      errorMSG: "Unallocated ETH. (BEX#517)",
    },
    BAL518: {
      keywords: ["BAL#518"],
      errorMSG:
        "Relayers cannot receive ETH directly (only through the Vault). (BEX#518)",
    },
    BAL519: {
      keywords: ["BAL#519"],
      errorMSG: "Cannot use ETH sentinel for internal balance. (BEX#519)",
    },
    BAL520: {
      keywords: ["BAL#520"],
      errorMSG: "Tokens mismatch. (BEX#520)",
    },
    BAL521: {
      keywords: ["BAL#521"],
      errorMSG: "Token is not registered. (BEX#521)",
    },
    BAL522: {
      keywords: ["BAL#522"],
      errorMSG: "Token is already registered. (BEX#522)",
    },
    BAL523: {
      keywords: ["BAL#523"],
      errorMSG: "Tokens are already set. (BEX#523)",
    },
    BAL524: {
      keywords: ["BAL#524"],
      errorMSG: "Tokens length must be 2. (BEX#524)",
    },
    BAL525: {
      keywords: ["BAL#525"],
      errorMSG: "Nonzero token balance detected. (BEX#525)",
    },
    BAL526: {
      keywords: ["BAL#526"],
      errorMSG: "Balance total overflow detected. (BEX#526)",
    },
    BAL527: {
      keywords: ["BAL#527"],
      errorMSG: "Pool has no tokens. (BEX#527)",
    },
    BAL528: {
      keywords: ["BAL#528"],
      errorMSG: "Insufficient flash loan balance. (BEX#528)",
    },
    // Fees
    BAL600: {
      keywords: ["BAL#600"],
      errorMSG: "Swap fee percentage is too high. (BEX#600)",
    },
    BAL601: {
      keywords: ["BAL#601"],
      errorMSG: "Flash loan fee percentage is too high. (BEX#601)",
    },
    BAL602: {
      keywords: ["BAL#602"],
      errorMSG: "Insufficient flash loan fee amount. (BEX#602)",
    },
    // FeeSplitter
    BAL700: {
      keywords: ["BAL#700"],
      errorMSG: "Splitter fee percentage is too high. (BEX#700)",
    },
    // Misc
    BAL998: {
      keywords: ["BAL#998"],
      errorMSG: "Unimplemented functionality. (BEX#998)",
    },
    BAL999: {
      keywords: ["BAL#999"],
      errorMSG: "An unexpected error occurred. (BEX#999)",
    },
    // SoR swap paths
    NO_SWAP_PATHS: {
      keywords: ["No swap paths returned"],
      errorMSG: "No swap paths were found.",
    },
  },
  LEND: {
    PRICE_FLUCTUATION: {
      keywords: [`function "borrow"`, `function "repay"`, "repay", "borrow"],
      errorMSG:
        "The price of the asset you are trying to borrow has fluctuated too much. Please try again.",
    },
  },
  POL: {
    REWARD_VAULT_FACTORY: {
      keywords: ["VaultAlreadyExists"],
      errorMSG:
        "Failed to create reward vault. A vault already exists with this staking token.",
    },
  },
  PERPS: {
    WRONG_LIMIT_PRICE: {
      keywords: ["WrongLimitPrice"],
      errorMSG:
        "Currently, Limit Prices must be set below the current price for long positions and above for short positions.",
    },
    PRICE_IMPACT_TOO_HIGH: {
      keywords: ["PriceImpactTooHigh"],
      errorMSG: "This position causes too much price impact.",
    },
    MAX_TRADES_PER_PAIR: {
      keywords: ["MaxTradesPerPair"],
      errorMSG:
        "You've exceeded your maximum amount of trades for this market!",
    },
    ABOVE_MAX_POS: {
      keywords: ["AboveMaxPos"],
      errorMSG: "The position's collateral is too high.",
    },
    ABOVE_MAX_GROUP_COLLATERAL: {
      keywords: ["AboveMaxGroupCollateral"],
      errorMSG:
        "The position's collateral is more than the vault can support for this market.",
    },
    BELOW_MIN_POS: {
      keywords: ["BelowMinPos"],
      errorMSG: "The position's volume (leveraged position size) is too low.",
    },
    LEVERAGE_INCORRECT: {
      keywords: ["LeverageIncorrect"],
      errorMSG: "The leverage for this position is either too low or too high.",
    },
    WRONG_TP: {
      keywords: ["WrongTp", "TpReached"],
      errorMSG: "The Take Profit is invalid for this position.",
    },
    WRONG_SL: {
      keywords: ["WrongSl", "SlReached"],
      errorMSG: "The Stop Loss is invalid for this position.",
    },
    NO_TRADE: {
      keywords: ["NoTrade"],
      errorMSG: "This position is no longer open.",
    },
    NO_LIMIT: {
      keywords: ["NoLimit"],
      errorMSG: "This order is no longer open.",
    },
    SLIPPAGE_EXCEEDED: {
      keywords: ["SlippageExceeded"],
      errorMSG:
        "The price just moved significantly! Please set a higher slippage.",
    },
    PAST_EXPOSURE_LIMITS: {
      keywords: ["PastExposureLimits"],
      errorMSG:
        "This position's volume is beyond the safe exposure limits of open interest. Please try again later or with a smaller size.",
    },
    PENDING_WITHDRAWAL: {
      keywords: ["PendingWithdrawal"],
      errorMSG:
        "You have a pending withdrawal. Please wait for it to be processed.",
    },
    MORE_THAN_WITHDRAW_AMOUNT: {
      keywords: ["InsufficientBalance"],
      errorMSG: "You can't cancel more than you've requested to withdraw.",
    },
    NOT_ENOUGH_ASSETS: {
      keywords: ["NotEnoughAssets", "MaxDailyPnL"],
      errorMSG: "The vault cannot settle your position at this time.",
    },
    ARITHMETIC_ERROR: {
      keywords: ["Arithmetic operation resulted in underflow or overflow."],
      errorMSG: "This operation reverted on chain. Please try again later.",
    },
    INVALID_REFERRER: {
      keywords: ["InvalidReferrer"],
      errorMSG: "The referrer address is invalid.",
    },
    ALREADY_REFERRED: {
      keywords: ["AlreadyReferred"],
      errorMSG: "You have already been referred.",
    },
    REFERRAL_CYCLE: {
      keywords: ["ReferralCycle"],
      errorMSG: "You cannot be referred by someone you have already referred.",
    },
    GENERIC_PARAMETERS_ERROR: {
      keywords: ["WrongParams"],
      errorMSG: "The given parameters are invalid.",
    },
    INVALID_PERMISSIONS: {
      keywords: ["Unauthorized"],
      errorMSG: "You are not permitted to execute this operation.",
    },
    PRICE_ORACLE_ERROR: {
      keywords: [
        "InvalidExpo",
        "NoFreshUpdate",
        "PriceFeedNotFoundWithinRange",
        "PriceFeedNotFound",
      ],
      errorMSG:
        "The price oracle failed to return correctly, please try again later.",
    },
    INVALID_CONFIDENCE: {
      keywords: ["InvalidConfidence"],
      errorMSG:
        "The price oracle returned with a very high uncertainty for this market. For safety. Please try again later.",
    },
    STALE_FEED: {
      keywords: ["StalePrice"],
      errorMSG:
        "The price feed from the oracle is currently stale. Please try again later.",
    },
    TRADING_PAUSED: {
      keywords: ["Paused"],
      errorMSG: "Trading has been momentarily paused.",
    },
    POSITION_TIMEOUT: {
      keywords: ["InTimeout"],
      errorMSG:
        "This position is currently in timeout. Please wait for the timeout to expire to execute.",
    },
    MAX_DEPOSIT: {
      keywords: ["MaxDeposit"],
      errorMSG:
        "The vault cannot currently support minting this much bHONEY right now. Please try an amount less than the current max deposit or come back later.",
    },
  },
};

export const getCustomAppErrorMessages = (
  e: any,
  app: "PERPS" | "BEND" | "BALANCER",
) => {
  if (e?.metaMessages?.[0]) {
    const errors = errorMsgMap[app] as ErrorCategory;
    for (const type in errors) {
      const errorType = errors[type];
      if (
        errorType?.keywords.some((keyword) =>
          e.metaMessages[0].includes(keyword),
        )
      ) {
        return errorType.errorMSG;
      }
    }
  }
};

export const tryMatchBalancerErrorCode = (
  errorMsgDetails: string,
): `BAL#${number}` | undefined => {
  // As a last-chance to catch a Balancer `BAL#` error code, we will attempt to string match
  if (errorMsgDetails.includes("BAL#")) {
    return errorMsgDetails.match(/BAL#\d{3}/)?.[0] as `BAL#${number}`;
  }
  return undefined;
};

export const getErrorMessage = (e: any): string => {
  let errorMsgDetails = e.message || "";

  // Normalize message for matching
  errorMsgDetails = errorMsgDetails.trim().toLowerCase();

  // Check against defined categories
  for (const category in errorMsgMap) {
    if (
      category !== "GENERAL_ERROR" &&
      typeof errorMsgMap[category] !== "string"
    ) {
      const errors = errorMsgMap[category] as ErrorCategory;
      for (const type in errors) {
        const errorType = errors[type];
        if (
          errorType?.keywords.some((keyword) =>
            errorMsgDetails.includes(keyword.toLowerCase().trim()),
          )
        ) {
          return errorType.errorMSG;
        }
      }
    }
  }

  // Attempt to identify a BAL# error code (unmapped)
  const balCode = tryMatchBalancerErrorCode(errorMsgDetails);
  if (balCode) return `Balancer Error: ${balCode}`;

  return errorMsgMap.GENERAL_ERROR;
};

export const getRevertReason = async (
  publicClient: PublicClient,
  txHash: string | undefined,
): Promise<string | undefined> => {
  if (!txHash) return "Transaction reverted for unknown reason.";
  try {
    // Use public client to get ethers provider since wagmi doesn't have the capability to get revert reasons
    const ethersProvider = clientToProvider(publicClient);
    // Get the transaction details
    const tx = await ethersProvider?.getTransaction(txHash);
    const response = await ethersProvider.call({
      ...(tx as any),
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
    });
    // Decode the error data (for some reason it's always at index 138)
    const reason = ethers.utils.toUtf8String(`0x${response.substring(138)}`);
    const cleanedReason = reason.replace(/[^\x20-\x7E]/g, ""); // Remove hidden UTF-8 characters

    // Match with Balancer error map
    const balancerErrors = errorMsgMap.BALANCER as ErrorCategory;
    for (const errorCode in balancerErrors) {
      const errorType = balancerErrors[errorCode];
      if (
        errorType?.keywords.some((keyword) => cleanedReason.includes(keyword))
      ) {
        return errorType.errorMSG;
      }
    }

    // Attempt to identify a BAL# error code (unmapped)
    const balCode = tryMatchBalancerErrorCode(cleanedReason);
    if (balCode) return `Balancer Error: ${balCode}`;

    // Fallback for unknown errors
    return cleanedReason || "Transaction reverted for an unknown reason.";
  } catch (error) {
    console.error(
      "Error fetching transaction or receipt revert reason: ",
      error,
    );
  }
};
