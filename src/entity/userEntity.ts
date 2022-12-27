import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Length, IsEmail, IsPhoneNumber } from "class-validator"
import { Wish } from '.';
import { wish_status } from './wishEntity';

export enum Role {
    customer,
    agent,
    admin
}

@Entity()
export default class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column()
    @Length(5,20)
    username: string

    @Column({nullable: true, default: 'sso'})
    password: string

    @Column({type: 'enum', enum: Role, default: Role.customer })
    role: Role;

    @Column()
    @Index({unique:true})
    @IsEmail()
    email: string;

    @Column({nullable: true})
    @Index({unique:true})
    @IsPhoneNumber()
    phone: string;

    @Column({nullable: true, default: 0})
    total_wish_count: number;

    @Column({nullable: true, default: 0})
    open_wish_count: number;

    @Column({nullable: true, length: 100})
    sign_in_provider: string;

    @Column({default: false, nullable:true})
    email_verified: boolean;

    @Column({default: false, nullable: true})
    mobile_verified: boolean;

    @Column({length: 1000, nullable: true})
    profile_url: string;

    @Column({length: 1000, nullable: true})
    profile_picture: string;

}