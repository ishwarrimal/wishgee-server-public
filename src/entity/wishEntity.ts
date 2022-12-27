import { open } from 'inspector';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import Result from './resultEntity';
export enum wish_status {
    open,
    reviewed,
    waiting_for_approval,
    resolved,
    closed,
    invalid
}

export enum recommendation_type {
    user_created,
    agent_created,
}

@Entity()
export default class Wish {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column({
        length: 300
    })
    title: string;

    @Column({
        length:500,
        nullable: true
    })
    description: string;

    @Column({
        length:500,
        nullable:true
    })
    keywords: string;

    @Column({
        length:500,
        nullable:true
    })
    brands_included: string;

    @Column({default: 0})
    max_budget: number;

    @Column({default: 0})
    min_budget: number;
    
    @Column({default: wish_status.open, enum: wish_status, type: "enum"})
    status: wish_status;

    @Column({default: recommendation_type.user_created, enum: recommendation_type, type: "enum"})
    recommendation_type: recommendation_type;
    
    @Column({nullable: true})
    agent_id: number;

    @Column({nullable: true})
    customer_id: number;

    @OneToOne(type => Result, {cascade: true, onDelete:"CASCADE"})
    @JoinColumn()
    result: Result;

    @Column("int", { array: true, default: [] })
    top_results: number[];
}

// getRepository('kid')
// .createQueryBuilder()
// .where(':kid_age = ANY (kid.kid_ages)', { kid_age: 5 });