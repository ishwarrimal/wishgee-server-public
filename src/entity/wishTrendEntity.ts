import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export default class WishTrend {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    date: Date;

    @Column({
        length: 100
    })
    title: string;

    @Column({
        length:200
    })
    subtitle: string;

    @Column({
        length:500
    })
    description: string;

    @Column({nullable:true})
    type: string;

    @Column({nullable:true})
    link: string;

    @Column({length: 1000,nullable:true})
    image: string;
}