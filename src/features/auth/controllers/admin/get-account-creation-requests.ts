import HTTP_STATUS from 'http-status-codes'

import { userService } from '@services/db/user.service'

import { Request, Response } from 'express'
import { IAuthDocument } from '@auth/interfaces/auth.interface'

export class GetAccountCreationRequests {
	public async read(req: Request, res: Response): Promise<void> {
		const accountCreationRequestsList: IAuthDocument = await userService.getAccountCreationRequests()

		res.status(HTTP_STATUS.OK).json({
			message: 'List of accounts that requested for join',
			success: true,
			data: accountCreationRequestsList
		})
	}

	public async getApprovedAccountsList(req: Request, res: Response): Promise<void> {
		const approvedAccountsList: IAuthDocument = await userService.getApprovedAccountsList()

		res.status(HTTP_STATUS.OK).json({
			message: 'List of approved accounts',
			success: true,
			data: approvedAccountsList
		})
	}
}
