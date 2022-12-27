import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export default class ProductType {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    date: Date;

    @Column({
        length: 100
    })
    type: string;

    @Column({
        length:20000
    })
    keywords: string;
}